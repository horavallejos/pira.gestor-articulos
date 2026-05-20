import fs from 'fs';
import path from 'path';
import { DbState, Product, Rubro, Category, Subcategory, Supplier } from './src/types';

const DB_PATH = path.join(process.cwd(), 'data', 'db.json');

// Ensure data directory exists
if (!fs.existsSync(path.dirname(DB_PATH))) {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
}

export function getDb(): DbState {
  if (!fs.existsSync(DB_PATH)) {
    const freshDb = generateSeededData();
    saveDb(freshDb);
    return freshDb;
  }
  try {
    const raw = fs.readFileSync(DB_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch (error) {
    console.error("Error reading DB file, re-creating database", error);
    const freshDb = generateSeededData();
    saveDb(freshDb);
    return freshDb;
  }
}

export function saveDb(state: DbState): void {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(state, null, 2), 'utf-8');
  } catch (error) {
    console.error("Error saving DB file", error);
  }
}

// Programmatic seeding to create highly realistic 1500+ products
function generateSeededData(): DbState {
  // 1. Seed Rubros (5)
  const rubros: Rubro[] = [
    { id: 'rub-1', name: 'Almacén' },
    { id: 'rub-2', name: 'Bebidas' },
    { id: 'rub-3', name: 'Limpieza' },
    { id: 'rub-4', name: 'Fiambrería' },
    { id: 'rub-5', name: 'Polvo y Perfumería' }
  ];

  // 2. Seed Categories (15)
  const categories: Category[] = [
    // Almacén (rub-1)
    { id: 'cat-1-1', name: 'Aceites y Vinagres', rubroId: 'rub-1' },
    { id: 'cat-1-2', name: 'Fideos y Pastas', rubroId: 'rub-1' },
    { id: 'cat-1-3', name: 'Arroz y Legumbres', rubroId: 'rub-1' },
    { id: 'cat-1-4', name: 'Salsas y Aderezos', rubroId: 'rub-1' },
    // Bebidas (rub-2)
    { id: 'cat-2-1', name: 'Gaseosas', rubroId: 'rub-2' },
    { id: 'cat-2-2', name: 'Aguas y Jugos', rubroId: 'rub-2' },
    { id: 'cat-2-3', name: 'Cervezas', rubroId: 'rub-2' },
    { id: 'cat-2-4', name: 'Vinos y Bodega', rubroId: 'rub-2' },
    // Limpieza (rub-3)
    { id: 'cat-3-1', name: 'Cuidado de Ropa', rubroId: 'rub-3' },
    { id: 'cat-3-2', name: 'Limpieza de Superficies', rubroId: 'rub-3' },
    { id: 'cat-3-3', name: 'Lavavajillas', rubroId: 'rub-3' },
    // Fiambrería (rub-4)
    { id: 'cat-4-1', name: 'Quesos', rubroId: 'rub-4' },
    { id: 'cat-4-2', name: 'Fiambres Blancos', rubroId: 'rub-4' },
    { id: 'cat-4-3', name: 'Embutidos', rubroId: 'rub-4' },
    // Perfumería (rub-5)
    { id: 'cat-5-1', name: 'Cuidado Capilar', rubroId: 'rub-5' },
    { id: 'cat-5-2', name: 'Higiene Personal', rubroId: 'rub-5' }
  ];

  // 3. Seed Subcategories (35)
  const subcategories: Subcategory[] = [
    // Aceites (cat-1-1)
    { id: 'sub-1-1-1', name: 'Aceite de Girasol', categoryId: 'cat-1-1' },
    { id: 'sub-1-1-2', name: 'Aceite de Oliva Extra Virgen', categoryId: 'cat-1-1' },
    { id: 'sub-1-1-3', name: 'Aceite de Maíz', categoryId: 'cat-1-1' },
    // Fideos (cat-1-2)
    { id: 'sub-1-2-1', name: 'Fideos Largos (Tallarines/Spaghetti)', categoryId: 'cat-1-2' },
    { id: 'sub-1-2-2', name: 'Fideos Cortos (Guisos/Mostacholes)', categoryId: 'cat-1-2' },
    { id: 'sub-1-2-3', name: 'Pastas Rellenas Secas', categoryId: 'cat-1-2' },
    // Arroz (cat-1-3)
    { id: 'sub-1-3-1', name: 'Arroz Largo Fino', categoryId: 'cat-1-3' },
    { id: 'sub-1-3-2', name: 'Arroz Doble Carolina', categoryId: 'cat-1-3' },
    { id: 'sub-1-3-3', name: 'Lentejas y Garbanzos', categoryId: 'cat-1-3' },
    // Salsas (cat-1-4)
    { id: 'sub-1-4-1', name: 'Salsa de Tomate Lista', categoryId: 'cat-1-4' },
    { id: 'sub-1-4-2', name: 'Mayonesa', categoryId: 'cat-1-4' },
    { id: 'sub-1-4-3', name: 'Ketchup y Mostaza', categoryId: 'cat-1-4' },
    // Gaseosas (cat-2-1)
    { id: 'sub-2-1-1', name: 'Gaseosas Cola (Regular/Zero)', categoryId: 'cat-2-1' },
    { id: 'sub-2-1-2', name: 'Gaseosas de Lima Limón', categoryId: 'cat-2-1' },
    { id: 'sub-2-1-3', name: 'Gaseosas de Naranja y Pomelo', categoryId: 'cat-2-1' },
    // Aguas (cat-2-2)
    { id: 'sub-2-2-1', name: 'Agua Mineral Sin Gas', categoryId: 'cat-2-2' },
    { id: 'sub-2-2-2', name: 'Agua Mineral Con Gas', categoryId: 'cat-2-2' },
    { id: 'sub-2-2-3', name: 'Aguas Saborizadas', categoryId: 'cat-2-2' },
    // Cervezas (cat-2-3)
    { id: 'sub-2-3-1', name: 'Cerveza Rubia Clásica', categoryId: 'cat-2-3' },
    { id: 'sub-2-3-2', name: 'Cerveza Roja e IPA', categoryId: 'cat-2-3' },
    { id: 'sub-2-3-3', name: 'Cerveza Negra', categoryId: 'cat-2-3' },
    // Vinos (cat-2-4)
    { id: 'sub-2-4-1', name: 'Vinos Tintos (Malbec/Cabernet)', categoryId: 'cat-2-4' },
    { id: 'sub-2-4-2', name: 'Vinos Blancos (Chardonnay/Torrontés)', categoryId: 'cat-2-4' },
    // Cuidado de ropa (cat-3-1)
    { id: 'sub-3-1-1', name: 'Jabón Líquido Ropa', categoryId: 'cat-3-1' },
    { id: 'sub-3-1-2', name: 'Suavizante Textil', categoryId: 'cat-3-1' },
    { id: 'sub-3-1-3', name: 'Quitamanchas y Lavandina Ropa', categoryId: 'cat-3-1' },
    // Superficies (cat-3-2)
    { id: 'sub-3-2-1', name: 'Limpiadores Multiuso', categoryId: 'cat-3-2' },
    { id: 'sub-3-2-2', name: 'Desinfectantes y Lavandina', categoryId: 'cat-3-2' },
    // Lavavajillas (cat-3-3)
    { id: 'sub-3-3-1', name: 'Detergente Sintético', categoryId: 'cat-3-3' },
    // Quesos (cat-4-1)
    { id: 'sub-4-1-1', name: 'Queso Cremoso / Mozzarella', categoryId: 'cat-4-1' },
    { id: 'sub-4-1-2', name: 'Queso Barra / de Máquina', categoryId: 'cat-4-1' },
    { id: 'sub-4-1-3', name: 'Quesos Duros y de Rallar', categoryId: 'cat-4-1' },
    // Fiambres (cat-4-2)
    { id: 'sub-4-2-1', name: 'Jamón Cocido y Paleta', categoryId: 'cat-4-2' },
    { id: 'sub-4-2-2', name: 'Jamón Crudo', categoryId: 'cat-4-2' },
    { id: 'sub-4-2-3', name: 'Panceta y Fiambres Ahumados', categoryId: 'cat-4-2' },
    // Embutidos (cat-4-3)
    { id: 'sub-4-3-1', name: 'Salamín y Salames', categoryId: 'cat-4-3' },
    { id: 'sub-4-3-2', name: 'Salchichas de Copetín/Mesa', categoryId: 'cat-4-3' },
    // Cuidado Capilar (cat-5-1)
    { id: 'sub-5-1-1', name: 'Shampoo Clásico', categoryId: 'cat-5-1' },
    { id: 'sub-5-1-2', name: 'Acondicionador e Hidratación', categoryId: 'cat-5-1' },
    // Higiene personal (cat-5-2)
    { id: 'sub-5-2-1', name: 'Jabón de Tocador', categoryId: 'cat-5-2' },
    { id: 'sub-5-2-2', name: 'Crema Dental y Enjuague', categoryId: 'cat-5-2' }
  ];

  // 4. Seed Suppliers (10)
  const suppliers: Supplier[] = [
    { id: 'sup-1', name: 'Molinos Río de la Plata', email: 'ventas@molinos.com.ar', phone: '0800-122-0234', address: 'Av. Manuel Belgrano 748, Buenos Aires' },
    { id: 'sup-2', name: 'Arcor S.A. Distribución', email: 'comercial@arcor.com', phone: '0800-444-2726', address: 'Fulgencio Yegros 514, Córdoba' },
    { id: 'sup-3', name: 'Coca-Cola Femsa Argentina', email: 'abastecimiento@cocacolasite.com.ar', phone: '11-4630-8000', address: 'Av. Amancio Alcorta 3570, Buenos Aires' },
    { id: 'sup-4', name: 'Cervecería y Maltería Quilmes', email: 'pedidos@quilmes.com.ar', phone: '0810-222-2337', address: 'Charcas 5160, Buenos Aires' },
    { id: 'sup-5', name: 'Mastellone Hnos (La Serenísima)', email: 'distribuidora@laserenisima.com.ar', phone: '0800-555-5273', address: 'Alte. Brown 957, General Rodríguez' },
    { id: 'sup-6', name: 'Unilever de Argentina S.A.', email: 'atencion.proveedores@unilever.com', phone: '0800-888-6666', address: 'Fraga 1163, Buenos Aires' },
    { id: 'sup-7', name: 'Cargill S.A.C.I.', email: 'cereales@cargill.com', phone: '11-4315-9000', address: 'Av. Leandro N. Alem 928, Buenos Aires' },
    { id: 'sup-8', name: 'Paladini S.A.', email: 'fiambres@paladini.com.ar', phone: '0800-222-7252', address: 'Ruta Nacional 34 Km 4, Villa Gobernador Gálvez' },
    { id: 'sup-9', name: 'AGD (Aceitera General Deheza)', email: 'comerciales@agd.com.ar', phone: '0358-467-6100', address: 'Av. Eduardo Arana 326, General Deheza' },
    { id: 'sup-10', name: 'Danone Argentina S.A.', email: 'aguas.danone@danone.com', phone: '0800-333-3111', address: 'Av. Córdoba 1122, Buenos Aires' }
  ];

  // Map subcategories back to their parent category and rubro easily
  const subToParentMap = new Map<string, { catId: string; rubId: string }>();
  subcategories.forEach(sub => {
    const cat = categories.find(c => c.id === sub.categoryId);
    if (cat) {
      subToParentMap.set(sub.id, { catId: cat.id, rubId: cat.rubroId });
    }
  });

  // Helper lists for name composition
  const brands: Record<string, string[]> = {
    'sub-1-1-1': ['Natura', 'Cocinero', 'Cañuelas', 'Marolio'], // Girasol
    'sub-1-1-2': ['Lira', 'Cocinero Oliva', 'Lucchetti Oliva', 'Sabor d\'Oliva'], // Oliva
    'sub-1-1-3': ['Natura Maíz', 'Mazola', 'Arcor Maíz'], // Maíz
    'sub-1-2-1': ['Lucchetti', 'Don Vicente', 'Matarazzo', 'Bari', 'Marolio', 'Terrabusi'], // Pastas largas
    'sub-1-2-2': ['Lucchetti', 'Matarazzo', 'Favorita', 'Yemina', 'Marolio'], // Pastas cortas
    'sub-1-2-3': ['Matarazzo Rellenos', 'La Salteña Secos', 'Giacomo'], // Rellenas
    'sub-1-3-1': ['Gallo Oro', 'Ala', 'Marolio', 'Molinos Ala'], // Arroz fino
    'sub-1-3-2': ['Gallo Doble', 'Molinos Doble', 'Taragüi Doble'], // Arroz carolina
    'sub-1-3-3': ['Inalpa', 'Arcor', 'Canale', 'Cumaná'], // Lentejas
    'sub-1-4-1': ['Arcor', 'Molto', 'Salsati', 'Cica', 'Marolio'], // Tomate
    'sub-1-4-2': ['Hellmann\'s', 'Natura', 'Fanacoa', 'Ri-K'], // Mayonesa
    'sub-1-4-3': ['Savora', 'Hellmann\'s', 'Dánica'], // Ketchup/Mostaza
    'sub-2-1-1': ['Coca-Cola', 'Coca-Cola Light', 'Coca-Cola Zero', 'Pepsi', 'Pepsi Black', 'Manaos Cola'], // Gaseosas cola
    'sub-2-1-2': ['Sprite', 'Sprite Zero', '7Up', '7Up Free', 'Manaos Lima'], // Lima
    'sub-2-1-3': ['Fanta', 'Fanta Sin Azúcar', 'Mirinda', 'Paso de los Toros Pomelo', 'Manaos Pomelo'], // Naranja
    'sub-2-2-1': ['Villa del Sur', 'Villavicencio', 'Kin', 'Eco de los Andes'], // Mineral sin gas
    'sub-2-2-2': ['Villa del Sur Con Gas', 'Villavicencio Gas', 'Cellier'], // Mineral con gas
    'sub-2-2-3': ['Levité Pomelo', 'Levité Naranja', 'Aquarius Manzana', 'Aquarius Pera', 'Baggio'], // Saborizadas
    'sub-2-3-1': ['Quilmes Bajo Cero', 'Quilmes Clásica', 'Brahma', 'Heineken', 'Budweiser'], // Cerveza rubia
    'sub-2-3-2': ['Patagonia IPA 24.7', 'Patagonia Amber Lager', 'Temple IPA', 'Stella Artois Noire'], // IPA/Roja
    'sub-2-3-3': ['Quilmes Stout', 'Patagonia Porter', 'Andes Origen Negra'], // Negra
    'sub-2-4-1': ['Rutini Cab-Malbec', 'Luigi Bosca Malbec', 'Santa Julia Tintillo', 'Alamos Malbec', 'Estancia Mendoza'], // Tintos
    'sub-2-4-2': ['Rutini Sauvignon', 'Luigi Bosca Chardonnay', 'Santa Julia Torrontés', 'Alamos Blanc'], // Blancos
    'sub-3-1-1': ['Ala Líquido', 'Skip Inteligente', 'Drive Concentrado', 'Querubín Líquido'], // Jabon ropa
    'sub-3-1-2': ['Vivere Clásico', 'Comfort Concentrado', 'Querubín Suavizante'], // Suavizante
    'sub-3-1-3': ['Vanish Gel', 'Ayudín Ropa Blanca', 'Trenet Espuma'], // Quitamanchas
    'sub-3-2-1': ['Cif Baño', 'Poett Fragancias', 'Lysoform Multiuso', 'Procén'], // Multiuso
    'sub-3-2-2': ['Ayudín Clásica', 'Lysoform Aerosol', 'Querubín Lavandina'], // Desinfectantes
    'sub-3-3-1': ['Cif Gel Vajilla', 'Magistral Multiuso', 'Ala Vajilla', 'DuraFlot'], // Detergente
    'sub-4-1-1': ['La Serenísima Cremón', 'Sancor Doble Crema', 'Barraza Mozzarella', 'Punta de Agua Cremoso'], // Queso cremoso
    'sub-4-1-2': ['La Serenísima de Máquina', 'Sancor Barra', 'Tregar Barra', 'Barraza Barra'], // Barra
    'sub-4-1-3': ['Sancor Sardo', 'La Serenísima Reggianito', 'Tregar Rallado', 'La Paulina Rallar'], // Quesos duros
    'sub-4-2-1': ['Paladini Jamón Cocido', 'Cabaña Argentina Jamón', 'Bari Paleta Especial'], // Jamon cocido
    'sub-4-2-2': ['Paladini Jamón Crudo', 'Cabaña Argentina Crudo', 'Caroya Crudo Especial'], // Crudo
    'sub-4-2-3': ['Paladini Panceta Ahumada', 'Cabaña Argentina Panceta', 'Bari Ahumado'], // Panceta
    'sub-4-3-1': ['Paladini Salamín Tandilero', 'Cabaña Argentina Salame Milán', 'Bari Copetín'], // Salame
    'sub-4-3-2': ['Swift Salchichas Clásicas', 'Paladini Salchichas', 'Granja Iris Salchichas x6'], // Salchichas
    'sub-5-1-1': ['Sedal Ceramidas', 'Sunsilk Brillo', 'Dove Reconstrucción Completa', 'Pantene Pro-V'], // Shampoo
    'sub-5-1-2': ['Sedal Acondicionador', 'Sunsilk Crema', 'Dove Nutrición', 'Pantene Anticaída'], // Crema enjuague
    'sub-5-2-1': ['Rexona Bamboo', 'Dove Original Jabón', 'Lux Suave', 'Palmolive Humectante'], // Jabon tocador
    'sub-5-2-2': ['Colgate Total 12', 'Oral-B Dental', 'Sensodyne Alivio', 'Colgate Triple Acción'] // Pasta dental
  };

  const packSizes = [
    'Envase Familiar', 'Tamaño Económico', 'Botella 1.5L', 'Botella 1L', 'Lata 473ml',
    'Pack x6 Unidades', 'Botella 2.25L', 'Envase Plástico 500ml', 'Pote de 500g', 'Paquete de 500g',
    'Sachet de 1L', 'Aerosol 360ml', 'Pastilla Suave 3x100g', 'Doypack 450ml', 'Pieza x 100g'
  ];

  const products: Product[] = [];
  let productCounter = 1;

  // Let's create about 1520 products programmatically!
  // We'll loop through each subcategory, and create combinations of Brands & Sizes & Descriptions
  subcategories.forEach(sub => {
    const parent = subToParentMap.get(sub.id);
    if (!parent) return;

    // Determine supplier based on category/rubro for realism
    let defaultSupplierId = 'sup-1';
    if (parent.rubId === 'rub-2') {
      // Bebidas
      if (sub.categoryId === 'cat-2-3') defaultSupplierId = 'sup-4'; // Quilmes
      else if (sub.categoryId === 'cat-2-1') defaultSupplierId = 'sup-3'; // Coca Cola
      else defaultSupplierId = 'sup-10'; // Danone
    } else if (parent.rubId === 'rub-3') {
      // Limpieza
      defaultSupplierId = 'sup-6'; // Unilever
    } else if (parent.rubId === 'rub-4') {
      // Fiambreria
      defaultSupplierId = (sub.categoryId === 'cat-4-1') ? 'sup-5' : 'sup-8'; // Sancor/Paladini
    } else if (parent.rubId === 'rub-5') {
      // Perfumeria
      defaultSupplierId = 'sup-6'; // Unilever
    } else {
      // Almacen
      if (sub.categoryId === 'cat-1-1') defaultSupplierId = 'sup-9'; // AGD for Aceites
      else if (sub.categoryId === 'cat-1-4') defaultSupplierId = 'sup-2'; // Arcor for Salsas
      else defaultSupplierId = 'sup-1'; // Molinos
    }

    const itemBrands = brands[sub.id] || ['Genérico'];
    const itemSizes = packSizes.slice(0, 10); // Take first 10 sizes

    // Generate multiple items to reach 1500+ across all subcategories
    // There are 38 subcategories. 1520 / 38 = 40 products per subcategory average.
    // Let's generate about 42 products per subcategory!
    for (let i = 0; i < 42; i++) {
      const brand = itemBrands[i % itemBrands.length];
      const sizeStr = itemSizes[(i + (itemBrands.indexOf(brand) * 3)) % itemSizes.length];
      const serialNum = (100 + i).toString();
      
      const subNameClean = sub.name.split(' (')[0];
      const name = `${subNameClean} ${brand} ${sizeStr} #${serialNum}`;
      const description = `Excelente opción de ${sub.name.toLowerCase()} marca ${brand} en presentación ${sizeStr.toLowerCase()}. Calidad garantizada para comercio y venta al público. Código de trazabilidad interna S-${serialNum}-${i}.`;
      
      // Generate realistic price ranges
      let basePrice = 450 + (i * 35);
      if (parent.rubId === 'rub-4') basePrice += 2000; // Cheese/ham is expensive
      if (sub.id === 'sub-2-4-1' || sub.id === 'sub-2-4-2') basePrice = 2500 + (i * 180); // Wines are expensive
      if (parent.rubId === 'rub-3') basePrice = 800 + (i * 60); // Cleaning is medium

      const retailPrice = parseFloat(basePrice.toFixed(2));
      const wholesalePrice = parseFloat((basePrice * 0.82).toFixed(2)); // 18% discount for wholesale

      // Generate a realistic local representation or placeholder for product image
      // Note: react needs JSX referrerPolicy="no-referrer" for random images
      const subCategoryKeywords: Record<string, string> = {
        'sub-1-1-1': 'oil', 'sub-1-1-2': 'olive', 'sub-1-1-3': 'cooking+oil',
        'sub-1-2-1': 'spaghetti', 'sub-1-2-2': 'pasta', 'sub-1-2-3': 'ravioli',
        'sub-1-3-1': 'rice', 'sub-1-3-2': 'grains', 'sub-1-3-3': 'beans',
        'sub-1-4-1': 'sauce', 'sub-1-4-2': 'mayo', 'sub-1-4-3': 'mustard',
        'sub-2-1-1': 'cola', 'sub-2-1-2': 'lemon+soda', 'sub-2-1-3': 'orange+soda',
        'sub-2-2-1': 'water', 'sub-2-2-2': 'sparkling+water', 'sub-2-2-3': 'juice',
        'sub-2-3-1': 'beer', 'sub-2-3-2': 'craft+beer', 'sub-2-3-3': 'stout+beer',
        'sub-2-4-1': 'red+wine', 'sub-2-4-2': 'white+wine',
        'sub-3-1-1': 'detergent', 'sub-3-1-2': 'softener', 'sub-3-1-3': 'bleach',
        'sub-3-2-1': 'cleaning+spray', 'sub-3-2-2': 'disinfectant',
        'sub-3-3-1': 'dishwashing+soap',
        'sub-4-1-1': 'cheese', 'sub-4-1-2': 'sliced+cheese', 'sub-4-1-3': 'grated+cheese',
        'sub-4-2-1': 'ham', 'sub-4-2-2': 'prosciutto', 'sub-4-2-3': 'bacon',
        'sub-4-3-1': 'salami', 'sub-4-3-2': 'sausage',
        'sub-5-1-1': 'shampoo', 'sub-5-1-2': 'conditioner',
        'sub-5-2-1': 'soap+bar', 'sub-5-2-2': 'toothpaste'
      };
      
      const keyword = subCategoryKeywords[sub.id] || 'product';
      const imageUrl = `https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=250&h=250&sig=${productCounter}`;

      // Alternate suppliers for variety
      const supIdx = (parseInt(defaultSupplierId.replace('sup-', '')) - 1 + i) % suppliers.length;
      const supplierId = `sup-${supIdx + 1}`;

      products.push({
        id: `prod-${productCounter}`,
        name,
        description,
        brand,
        rubroId: parent.rubId,
        categoryId: parent.catId,
        subcategoryId: sub.id,
        supplierId,
        retailPrice,
        wholesalePrice,
        imageUrl,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      productCounter++;
    }
  });

  return {
    rubros,
    categories,
    subcategories,
    suppliers,
    products
  };
}
