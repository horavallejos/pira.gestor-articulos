import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { getDb, saveDb } from './server_db';
import { Product, Rubro, Category, Subcategory, Supplier, SemanticSearchParams } from './src/types';

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Initialise Gemini helper
let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  try {
    ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
    console.log("Gemini AI successfully initialized.");
  } catch (err) {
    console.error("Failed to initialize Gemini AI: ", err);
  }
} else {
  console.warn("GEMINI_API_KEY is missing, semantic natural language search will fall back to exact keyword match.");
}

// ------------------------------------------------------------------
// API ENDPOINTS - RUBROS
// ------------------------------------------------------------------
app.get('/api/rubros', (req, res) => {
  try {
    const db = getDb();
    res.json(db.rubros);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener rubros' });
  }
});

app.post('/api/rubros', (req, res) => {
  try {
    const db = getDb();
    const { name } = req.body;
    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'El nombre es obligatorio' });
    }
    const newRubro = {
      id: `rub-${Date.now()}`,
      name: name.trim()
    };
    db.rubros.push(newRubro);
    saveDb(db);
    res.status(201).json(newRubro);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear rubro' });
  }
});

app.put('/api/rubros/:id', (req, res) => {
  try {
    const db = getDb();
    const { id } = req.params;
    const { name } = req.body;
    const rubro = db.rubros.find(r => r.id === id);
    if (!rubro) return res.status(404).json({ error: 'Rubro no encontrado' });
    if (!name || name.trim() === '') return res.status(400).json({ error: 'El nombre es obligatorio' });
    
    rubro.name = name.trim();
    saveDb(db);
    res.json(rubro);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar rubro' });
  }
});

app.delete('/api/rubros/:id', (req, res) => {
  try {
    const db = getDb();
    const { id } = req.params;
    // Check if rubro is used by any category
    const linkedCat = db.categories.some(c => c.rubroId === id);
    const linkedProd = db.products.some(p => p.rubroId === id);
    if (linkedCat || linkedProd) {
      return res.status(400).json({ error: 'No se puede eliminar: el rubro está siendo utilizado por categorías o productos' });
    }
    db.rubros = db.rubros.filter(r => r.id !== id);
    saveDb(db);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar rubro' });
  }
});

// ------------------------------------------------------------------
// API ENDPOINTS - CATEGORIES
// ------------------------------------------------------------------
app.get('/api/categories', (req, res) => {
  try {
    const db = getDb();
    res.json(db.categories);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener categorías' });
  }
});

app.post('/api/categories', (req, res) => {
  try {
    const db = getDb();
    const { name, rubroId } = req.body;
    if (!name || name.trim() === '') return res.status(400).json({ error: 'El nombre es obligatorio' });
    if (!rubroId) return res.status(400).json({ error: 'El rubro es obligatorio' });
    
    const dbRubro = db.rubros.find(r => r.id === rubroId);
    if (!dbRubro) return res.status(400).json({ error: 'Rubro no válido' });

    const newCategory = {
      id: `cat-${Date.now()}`,
      name: name.trim(),
      rubroId
    };
    db.categories.push(newCategory);
    saveDb(db);
    res.status(201).json(newCategory);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear categoría' });
  }
});

app.put('/api/categories/:id', (req, res) => {
  try {
    const db = getDb();
    const { id } = req.params;
    const { name, rubroId } = req.body;
    const category = db.categories.find(c => c.id === id);
    if (!category) return res.status(404).json({ error: 'Categoría no encontrada' });
    if (!name || name.trim() === '') return res.status(400).json({ error: 'El nombre es obligatorio' });
    if (!rubroId) return res.status(400).json({ error: 'El rubro es obligatorio' });

    const dbRubro = db.rubros.find(r => r.id === rubroId);
    if (!dbRubro) return res.status(400).json({ error: 'Rubro no válido' });

    category.name = name.trim();
    category.rubroId = rubroId;
    saveDb(db);
    res.json(category);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar categoría' });
  }
});

app.delete('/api/categories/:id', (req, res) => {
  try {
    const db = getDb();
    const { id } = req.params;
    const linkedSub = db.subcategories.some(s => s.categoryId === id);
    const linkedProd = db.products.some(p => p.categoryId === id);
    if (linkedSub || linkedProd) {
      return res.status(400).json({ error: 'No se puede eliminar: la categoría está siendo utilizada por subcategorías o productos' });
    }
    db.categories = db.categories.filter(c => c.id !== id);
    saveDb(db);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar categoría' });
  }
});

// ------------------------------------------------------------------
// API ENDPOINTS - SUBCATEGORIES
// ------------------------------------------------------------------
app.get('/api/subcategories', (req, res) => {
  try {
    const db = getDb();
    res.json(db.subcategories);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener subcategorías' });
  }
});

app.post('/api/subcategories', (req, res) => {
  try {
    const db = getDb();
    const { name, categoryId } = req.body;
    if (!name || name.trim() === '') return res.status(400).json({ error: 'El nombre es obligatorio' });
    if (!categoryId) return res.status(400).json({ error: 'La categoría es obligatoria' });
    
    const dbCat = db.categories.find(c => c.id === categoryId);
    if (!dbCat) return res.status(400).json({ error: 'Categoría no válida' });

    const newSubcategory = {
      id: `sub-${Date.now()}`,
      name: name.trim(),
      categoryId
    };
    db.subcategories.push(newSubcategory);
    saveDb(db);
    res.status(201).json(newSubcategory);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear subcategoría' });
  }
});

app.put('/api/subcategories/:id', (req, res) => {
  try {
    const db = getDb();
    const { id } = req.params;
    const { name, categoryId } = req.body;
    const sub = db.subcategories.find(s => s.id === id);
    if (!sub) return res.status(404).json({ error: 'Subcategoría no encontrada' });
    if (!name || name.trim() === '') return res.status(400).json({ error: 'El nombre es obligatorio' });
    if (!categoryId) return res.status(400).json({ error: 'La categoría es obligatoria' });

    const dbCat = db.categories.find(c => c.id === categoryId);
    if (!dbCat) return res.status(400).json({ error: 'Categoría no válida' });

    sub.name = name.trim();
    sub.categoryId = categoryId;
    saveDb(db);
    res.json(sub);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar subcategoría' });
  }
});

app.delete('/api/subcategories/:id', (req, res) => {
  try {
    const db = getDb();
    const { id } = req.params;
    const linkedProd = db.products.some(p => p.subcategoryId === id);
    if (linkedProd) {
      return res.status(400).json({ error: 'No se puede eliminar: la subcategoría está siendo utilizada por productos' });
    }
    db.subcategories = db.subcategories.filter(s => s.id !== id);
    saveDb(db);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar subcategoría' });
  }
});

// ------------------------------------------------------------------
// API ENDPOINTS - SUPPLIERS
// ------------------------------------------------------------------
app.get('/api/suppliers', (req, res) => {
  try {
    const db = getDb();
    res.json(db.suppliers);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener proveedores' });
  }
});

app.post('/api/suppliers', (req, res) => {
  try {
    const db = getDb();
    const { name, email, phone, address } = req.body;
    if (!name || name.trim() === '') return res.status(400).json({ error: 'El nombre del proveedor es obligatorio' });

    const newSupplier = {
      id: `sup-${Date.now()}`,
      name: name.trim(),
      email: (email || '').trim(),
      phone: (phone || '').trim(),
      address: (address || '').trim()
    };
    db.suppliers.push(newSupplier);
    saveDb(db);
    res.status(201).json(newSupplier);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear proveedor' });
  }
});

app.put('/api/suppliers/:id', (req, res) => {
  try {
    const db = getDb();
    const { id } = req.params;
    const { name, email, phone, address } = req.body;
    const supplier = db.suppliers.find(s => s.id === id);
    if (!supplier) return res.status(404).json({ error: 'Proveedor no encontrado' });
    if (!name || name.trim() === '') return res.status(400).json({ error: 'El nombre es obligatorio' });

    supplier.name = name.trim();
    supplier.email = (email || '').trim();
    supplier.phone = (phone || '').trim();
    supplier.address = (address || '').trim();
    saveDb(db);
    res.json(supplier);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar proveedor' });
  }
});

app.delete('/api/suppliers/:id', (req, res) => {
  try {
    const db = getDb();
    const { id } = req.params;
    const linkedProd = db.products.some(p => p.supplierId === id);
    if (linkedProd) {
      return res.status(400).json({ error: 'No se puede eliminar: el proveedor tiene productos asociados' });
    }
    db.suppliers = db.suppliers.filter(s => s.id !== id);
    saveDb(db);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar proveedor' });
  }
});

// ------------------------------------------------------------------
// API ENDPOINTS - PRODUCTS (CRUD)
// ------------------------------------------------------------------
app.get('/api/products', (req, res) => {
  try {
    const db = getDb();
    res.json(db.products);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener productos' });
  }
});

app.get('/api/products/:id', (req, res) => {
  try {
    const db = getDb();
    const product = db.products.find(p => p.id === req.params.id);
    if (!product) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener el producto' });
  }
});

app.post('/api/products', (req, res) => {
  try {
    const db = getDb();
    const {
      name, description, brand, rubroId, categoryId, subcategoryId, supplierId,
      retailPrice, wholesalePrice, imageUrl
    } = req.body;

    if (!name || name.trim() === '') return res.status(400).json({ error: 'El nombre es obligatorio' });
    if (!rubroId) return res.status(400).json({ error: 'El rubro es obligatorio' });
    if (!categoryId) return res.status(400).json({ error: 'La categoría es obligatoria' });
    if (!subcategoryId) return res.status(400).json({ error: 'La subcategoría es obligatoria' });
    if (!supplierId) return res.status(400).json({ error: 'El proveedor es obligatorio' });
    if (retailPrice === undefined || retailPrice < 0) return res.status(400).json({ error: 'Precio minorista inválido' });
    if (wholesalePrice === undefined || wholesalePrice < 0) return res.status(400).json({ error: 'Precio mayorista inválido' });

    // Validate relationships
    if (!db.rubros.some(r => r.id === rubroId)) return res.status(400).json({ error: 'Rubro no válido' });
    if (!db.categories.some(c => c.id === categoryId)) return res.status(400).json({ error: 'Categoría no válida' });
    if (!db.subcategories.some(s => s.id === subcategoryId)) return res.status(400).json({ error: 'Subcategoría no válida' });
    if (!db.suppliers.some(s => s.id === supplierId)) return res.status(400).json({ error: 'Proveedor no válido' });

    const newProduct: Product = {
      id: `prod-${Date.now()}`,
      name: name.trim(),
      description: (description || '').trim(),
      brand: (brand || '').trim() || 'Genérico',
      rubroId,
      categoryId,
      subcategoryId,
      supplierId,
      retailPrice: parseFloat(retailPrice),
      wholesalePrice: parseFloat(wholesalePrice),
      imageUrl: (imageUrl || '').trim() || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=250&h=250',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.products.unshift(newProduct); // Add to the top
    saveDb(db);
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear el producto' });
  }
});

app.put('/api/products/:id', (req, res) => {
  try {
    const db = getDb();
    const { id } = req.params;
    const product = db.products.find(p => p.id === id);
    if (!product) return res.status(404).json({ error: 'Producto no encontrado' });

    const {
      name, description, brand, rubroId, categoryId, subcategoryId, supplierId,
      retailPrice, wholesalePrice, imageUrl
    } = req.body;

    if (!name || name.trim() === '') return res.status(400).json({ error: 'El nombre es obligatorio' });
    if (!rubroId) return res.status(400).json({ error: 'El rubro es obligatorio' });
    if (!categoryId) return res.status(400).json({ error: 'La categoría es obligatoria' });
    if (!subcategoryId) return res.status(400).json({ error: 'La subcategoría es obligatoria' });
    if (!supplierId) return res.status(400).json({ error: 'El proveedor es obligatorio' });
    if (retailPrice === undefined || retailPrice < 0) return res.status(400).json({ error: 'Precio minorista inválido' });
    if (wholesalePrice === undefined || wholesalePrice < 0) return res.status(400).json({ error: 'Precio mayorista inválido' });

    // Validate relationships
    if (!db.rubros.some(r => r.id === rubroId)) return res.status(400).json({ error: 'Rubro no válido' });
    if (!db.categories.some(c => c.id === categoryId)) return res.status(400).json({ error: 'Categoría no válida' });
    if (!db.subcategories.some(s => s.id === subcategoryId)) return res.status(400).json({ error: 'Subcategoría no válida' });
    if (!db.suppliers.some(s => s.id === supplierId)) return res.status(400).json({ error: 'Proveedor no válido' });

    product.name = name.trim();
    product.description = (description || '').trim();
    product.brand = (brand || '').trim() || 'Genérico';
    product.rubroId = rubroId;
    product.categoryId = categoryId;
    product.subcategoryId = subcategoryId;
    product.supplierId = supplierId;
    product.retailPrice = parseFloat(retailPrice);
    product.wholesalePrice = parseFloat(wholesalePrice);
    product.imageUrl = (imageUrl || '').trim() || '/product-placeholder.png';
    product.updatedAt = new Date().toISOString();

    saveDb(db);
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar el producto' });
  }
});

app.delete('/api/products/:id', (req, res) => {
  try {
    const db = getDb();
    const { id } = req.params;
    const initialLen = db.products.length;
    db.products = db.products.filter(p => p.id !== id);
    if (db.products.length === initialLen) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    saveDb(db);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar el producto' });
  }
});

// ------------------------------------------------------------------
// API ENDPOINT - BULK PRICE UPDATE (Modificación de Precios a Granel)
// ------------------------------------------------------------------
app.post('/api/products/bulk-price-update', (req, res) => {
  try {
    const db = getDb();
    const {
      percentage,
      priceType, // 'retail' | 'wholesale' | 'both'
      rubroId,
      categoryId,
      subcategoryId,
      supplierId,
      brand,
      roundingMode // 'none' | 'two-dec' | 'no-cents' | 'fifties'
    } = req.body;

    if (percentage === undefined || isNaN(percentage)) {
      return res.status(400).json({ error: 'El porcentaje de incremento/decremento es obligatorio y debe ser un número.' });
    }

    const pctFactor = 1 + (percentage / 100);
    let matchedCount = 0;

    db.products = db.products.map(p => {
      // Check filters
      if (rubroId && p.rubroId !== rubroId) return p;
      if (categoryId && p.categoryId !== categoryId) return p;
      if (subcategoryId && p.subcategoryId !== subcategoryId) return p;
      if (supplierId && p.supplierId !== supplierId) return p;
      if (brand && p.brand.toLowerCase() !== brand.toLowerCase()) return p;

      matchedCount++;
      const updatedProduct = { ...p, updatedAt: new Date().toISOString() };

      const applyRounding = (val: number): number => {
        if (roundingMode === 'no-cents') {
          return Math.round(val);
        } else if (roundingMode === 'fifties') {
          // Round to nearest 50 pesos
          return Math.round(val / 50) * 50;
        } else {
          // Default: 2 decimals
          return parseFloat(val.toFixed(2));
        }
      };

      if (priceType === 'retail' || priceType === 'both') {
        updatedProduct.retailPrice = applyRounding(p.retailPrice * pctFactor);
      }
      if (priceType === 'wholesale' || priceType === 'both') {
        updatedProduct.wholesalePrice = applyRounding(p.wholesalePrice * pctFactor);
      }

      return updatedProduct;
    });

    saveDb(db);

    res.json({
      success: true,
      message: `¡Precios actualizados con éxito! Se modificaron ${matchedCount} productos aplicando un ${percentage}% en el precio ${priceType === 'both' ? 'minorista y mayorista' : priceType === 'retail' ? 'minorista' : 'mayorista'}.`,
      count: matchedCount
    });
  } catch (error) {
    console.error("Error doing bulk price update:", error);
    res.status(500).json({ error: 'Error interno al actualizar precios a granel.' });
  }
});

// ------------------------------------------------------------------
// API ENDPOINT - SEMANTIC SEARCH USING GEMINI AI (Buscador Semántico)
// ------------------------------------------------------------------
app.post('/api/products/semantic-search', async (req, res) => {
  try {
    const db = getDb();
    const { query } = req.body;

    if (!query || query.trim() === '') {
      return res.json({ products: db.products, criteria: {} });
    }

    const queryLower = query.toLowerCase().trim();

    // Check if Gemini is enabled and we should parse semantically
    if (ai) {
      try {
        console.log(`Analyzing query semantically with Gemini: "${query}"`);

        // We prepare catalogs as simple strings to help Gemini match IDs correctly
        const rubrosCatalog = db.rubros.map(r => `${r.id}: ${r.name}`).join('\n');
        const suppliersCatalog = db.suppliers.map(s => `${s.id}: ${s.name}`).join('\n');
        
        // Let's take first 20 categories & subcategories to avoid blowing token limit
        const categoriesCatalog = db.categories.map(c => `${c.id}: ${c.name} (Rubro: ${c.rubroId})`).join('\n');
        const subcategoriesCatalog = db.subcategories.map(s => `${s.id}: ${s.name}`).slice(0, 40).join('\n') + "\nentre otras...";

        const prompt = `Analiza la siguiente búsqueda de un usuario en un sistema de stock comercial y extrae los filtros estructurados que correspondan.
        
BÚSQUEDA DEL USUARIO: "${query}"

CATÁLOGO NUESTRO:
--- RUBROS ---
${rubrosCatalog}

--- CATEGORÍAS ---
${categoriesCatalog}

--- SUBCATEGORÍAS ---
${subcategoriesCatalog}

--- PROVEEDORES ---
${suppliersCatalog}

Reglas críticas de extracción:
1. Extrae 'searchTerm' con los sustantivos del artículo buscado (ej: "fideos", "aceite", "cerveza") sin adjetivos de precio o marca.
2. Identifica si mencionan una marca (ej: "Rutini", "Coca-Cola", "Paladini") y colócala en 'brand'.
3. Si el usuario pide un rubro, categoría, subcategoría o proveedor de la lista, extrae de forma exacta el id correpondiente (ej: "rub-1"). Si no hay coincidencia exacta de ID, pon null.
4. Si menciona límites de precio como "menos de 2000" o "hasta 5000", pon maxPrice = 2000 o 5000. Si pide "más de 1500" o "desde 1500", pon minPrice = 1500.
5. Si menciona explícitamente "mayorista" o "al por mayor", asigna priceType = "wholesale". Si menciona "minorista" o "al público", asigna priceType = "retail".
6. Devuelve estrictamente el JSON sin Markdown ni comentarios extra.`;

        const geminiResponse = await ai.models.generateContent({
          model: 'gemini-3.5-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                searchTerm: { type: Type.STRING, description: 'Término genérico de búsqueda o palabra clave, o null si no hay' },
                brand: { type: Type.STRING, description: 'Marca identificada, o null si no se menciona una específica' },
                rubroId: { type: Type.STRING, description: 'ID de rubro correspondiente si coincide, o null' },
                categoryId: { type: Type.STRING, description: 'ID de categoría correspondiente si coincide, o null' },
                subcategoryId: { type: Type.STRING, description: 'ID de subcategoría correspondiente si coincide, o null' },
                supplierId: { type: Type.STRING, description: 'ID de proveedor correspondiente si coincide, o null' },
                minPrice: { type: Type.NUMBER, description: 'Precio de partida o null' },
                maxPrice: { type: Type.NUMBER, description: 'Precio tope o null' },
                priceType: { type: Type.STRING, description: 'Tipo de precio: "retail" o "wholesale" o null' }
              }
            }
          }
        });

        const jsonStr = geminiResponse.text?.trim() || '{}';
        const parsed: SemanticSearchParams = JSON.parse(jsonStr);

        console.log("Parsed Semantic Parameters from LLM:", parsed);

        // Apply LLM Filters to Database
        let results = db.products;

        if (parsed.rubroId) {
          results = results.filter(p => p.rubroId === parsed.rubroId);
        }
        if (parsed.categoryId) {
          results = results.filter(p => p.categoryId === parsed.categoryId);
        }
        if (parsed.subcategoryId) {
          results = results.filter(p => p.subcategoryId === parsed.subcategoryId);
        }
        if (parsed.supplierId) {
          results = results.filter(p => p.supplierId === parsed.supplierId);
        }
        if (parsed.brand) {
          results = results.filter(p => p.brand.toLowerCase().includes(parsed.brand!.toLowerCase()));
        }

        // Price constraints
        if (parsed.minPrice !== undefined && parsed.minPrice !== null) {
          const type = parsed.priceType || 'retail';
          results = results.filter(p => {
            const price = type === 'wholesale' ? p.wholesalePrice : p.retailPrice;
            return price >= parsed.minPrice!;
          });
        }
        if (parsed.maxPrice !== undefined && parsed.maxPrice !== null) {
          const type = parsed.priceType || 'retail';
          results = results.filter(p => {
            const price = type === 'wholesale' ? p.wholesalePrice : p.retailPrice;
            return price <= parsed.maxPrice!;
          });
        }

        // Generic text match on description, name or brand with 'searchTerm'
        if (parsed.searchTerm) {
          const term = parsed.searchTerm.toLowerCase();
          results = results.filter(p => 
            p.name.toLowerCase().includes(term) ||
            p.description.toLowerCase().includes(term) ||
            p.brand.toLowerCase().includes(term)
          );
        }

        // If no results matched the highly specific extracted LLM queries (e.g. LLM misidentified something)
        // fall back on a rich keyword match
        if (results.length === 0) {
          console.log("LLM-filtered search yielded 0 items, falling back to full text index matching.");
          results = keywordFallbackSearch(db.products, queryLower);
        }

        return res.json({
          products: results,
          criteria: parsed,
          mode: 'semantic'
        });

      } catch (err) {
        console.error("Gemini AI parse error, executing keyword search fallback:", err);
      }
    }

    // Default Fallback Keyword/Text Search
    const results = keywordFallbackSearch(db.products, queryLower);
    return res.json({
      products: results,
      criteria: { searchTerm: query },
      mode: 'fallback'
    });

  } catch (error) {
    console.error("Error in semantic search:", error);
    res.status(500).json({ error: 'Error en la búsqueda semántica' });
  }
});

function keywordFallbackSearch(products: Product[], query: string): Product[] {
  const parts = query.split(/\s+/).filter(p => p.length > 0);
  if (parts.length === 0) return products;

  return products.filter(p => {
    return parts.every(part => {
      // Check if matches simple price ranges
      if (part.startsWith('<') && !isNaN(Number(part.slice(1)))) {
        return p.retailPrice < Number(part.slice(1));
      }
      if (part.startsWith('>') && !isNaN(Number(part.slice(1)))) {
        return p.retailPrice > Number(part.slice(1));
      }
      // Matches name, description, brand, rubro, ids etc
      return p.name.toLowerCase().includes(part) ||
             p.description.toLowerCase().includes(part) ||
             p.brand.toLowerCase().includes(part) ||
             p.rubroId.toLowerCase().includes(part) ||
             p.categoryId.toLowerCase().includes(part) ||
             p.subcategoryId.toLowerCase().includes(part);
    });
  });
}

// ------------------------------------------------------------------
// API ENDPOINT - DATABASE RECOVERY & CONFIGS (Backup & Restore)
// ------------------------------------------------------------------
app.get('/api/db/export', (req, res) => {
  try {
    const db = getDb();
    res.setHeader('Content-disposition', 'attachment; filename=stock_db_backup.json');
    res.setHeader('Content-type', 'application/json');
    res.send(JSON.stringify(db, null, 2));
  } catch (error) {
    res.status(500).json({ error: 'Error al exportar base de datos' });
  }
});

app.post('/api/db/restore', (req, res) => {
  try {
    const restoredData = req.body;
    if (!restoredData.rubros || !restoredData.categories || !restoredData.subcategories || !restoredData.suppliers || !restoredData.products) {
      return res.status(400).json({ error: 'Formato de base de datos no compatible. Debe contener rubros, categories, subcategories, suppliers y products.' });
    }
    saveDb(restoredData);
    res.json({ success: true, message: 'Base de datos restaurada correctamente.', count: restoredData.products.length });
  } catch (error) {
    res.status(500).json({ error: 'Error al restaurar la base de datos.' });
  }
});

// Reset Database to Seed defaults
app.post('/api/db/reset', (req, res) => {
  try {
    const DB_PATH = path.join(process.cwd(), 'data', 'db.json');
    if (fs.existsSync(DB_PATH)) {
      fs.unlinkSync(DB_PATH);
    }
    const freshDb = getDb();
    res.json({ success: true, message: 'Base de datos reiniciada al estado de fábrica.', count: freshDb.products.length });
  } catch (error) {
    res.status(500).json({ error: 'Error al reiniciar la base de datos.' });
  }
});

// Get Database Info/Statistics for Dashboard
app.get('/api/db/stats', (req, res) => {
  try {
    const db = getDb();
    
    // Calculate stats
    const totalProd = db.products.length;
    const totalRubros = db.rubros.length;
    const totalCategories = db.categories.length;
    const totalSubcategories = db.subcategories.length;
    const totalSuppliers = db.suppliers.length;

    // Average price
    let sumRetail = 0;
    let sumWholesale = 0;
    db.products.forEach(p => {
      sumRetail += p.retailPrice;
      sumWholesale += p.wholesalePrice;
    });
    const avgRetail = totalProd > 0 ? parseFloat((sumRetail / totalProd).toFixed(2)) : 0;
    const avgWholesale = totalProd > 0 ? parseFloat((sumWholesale / totalProd).toFixed(2)) : 0;

    // Distribution by rubro
    const distribRubro = db.rubros.map(r => {
      const count = db.products.filter(p => p.rubroId === r.id).length;
      return { id: r.id, name: r.name, count };
    });

    // Top brands
    const brandMap: Record<string, number> = {};
    db.products.forEach(p => {
      brandMap[p.brand] = (brandMap[p.brand] || 0) + 1;
    });
    const topBrands = Object.entries(brandMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a,b) => b.count - a.count)
      .slice(0, 5);

    res.json({
      totalProducts: totalProd,
      totalRubros,
      totalCategories,
      totalSubcategories,
      totalSuppliers,
      avgRetailPrice: avgRetail,
      avgWholesalePrice: avgWholesale,
      distribRubro,
      topBrands
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al calcular estadísticas' });
  }
});

// ------------------------------------------------------------------
// VITE AND ASSETS MIDDLEWARE FOR DEV & PROD BUILD SYSTEM
// ------------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on address PORT: http://0.0.0.0:${PORT}`);
  });
}

startServer();
