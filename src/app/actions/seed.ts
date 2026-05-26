"use server";

import { createClient } from '@/lib/server';
import { revalidatePath } from 'next/cache';

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

async function seedCategories(supabase: any) {
  const categories = [
    { name: 'Refrigerators', description: 'Refrigerators, freezers, and cooling solutions for every home.', image_url: 'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=800' },
    { name: 'Washing Machines', description: 'Washers, dryers, and laundry care appliances.', image_url: 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=800' },
    { name: 'Kitchen Appliances', description: 'Stoves, ovens, microwaves, and kitchen essentials.', image_url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800' },
    { name: 'Air Conditioners', description: 'Window type, split type, and portable air conditioners.', image_url: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=800' },
    { name: 'Televisions & Audio', description: 'LED, OLED, smart TVs, and home entertainment systems.', image_url: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800' },
    { name: 'Small Appliances', description: 'Blenders, rice cookers, fans, and everyday essentials.', image_url: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=800' },
  ];

  for (const cat of categories) {
    const { data: existing } = await supabase.from('categories').select('id').eq('slug', slugify(cat.name)).single();
    if (!existing) {
      await supabase.from('categories').insert({ ...cat, slug: slugify(cat.name) });
    }
  }
  console.log('Categories seeded');
}

async function seedBrands(supabase: any) {
  const brands = [
    { name: 'Panasonic', description: 'Japanese electronics and home appliances brand.' },
    { name: 'Samsung', description: 'South Korean multinational electronics corporation.' },
    { name: 'LG', description: 'South Korean conglomerate known for electronics and appliances.' },
    { name: 'Condura', description: 'Filipino brand of home appliances.' },
    { name: 'Whirlpool', description: 'American multinational home appliance manufacturer.' },
    { name: 'Sharp', description: 'Japanese electronics company known for innovation.' },
    { name: 'Toshiba', description: 'Japanese multinational conglomerate.' },
    { name: 'Midea', description: 'Chinese appliance manufacturer, world\'s largest.' },
    { name: 'Fujidenzo', description: 'Filipino brand of home and kitchen appliances.' },
    { name: 'American Home', description: 'Brand offering affordable home appliances.' },
  ];

  for (const brand of brands) {
    const { data: existing } = await supabase.from('brands').select('id').eq('slug', slugify(brand.name)).single();
    if (!existing) {
      await supabase.from('brands').insert({ ...brand, slug: slugify(brand.name) });
    }
  }
  console.log('Brands seeded');
}

async function seedProducts(supabase: any, categoryMap: Record<string, string>, brandMap: Record<string, string>) {
  const products = [
    { name: 'Panasonic Inverter Refrigerator NR-BW465X', category: 'Refrigerators', brand: 'Panasonic', base_price: 54999, description: '465L 2-door inverter refrigerator with Econavi smart sensing technology. Energy-saving and spacious. Ideal for Filipino families.', image_url: 'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=800', specs: { capacity: '465L', type: '2-Door', energy_star: '5 Star', warranty: '7 Years Compressor' } },
    { name: 'Condura 6.5kg Washing Machine CWM6510', category: 'Washing Machines', brand: 'Condura', base_price: 12999, description: '6.5kg top-load washing machine with multiple wash programs and gentle care technology.', image_url: 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=800', specs: { capacity: '6.5kg', type: 'Top Load', spin_speed: '700 RPM' } },
    { name: 'Samsung 55" 4K Smart TV UA55CU8000', category: 'Televisions & Audio', brand: 'Samsung', base_price: 45999, description: '55-inch Crystal UHD 4K Smart TV with HDR10+ and Tizen OS. Sleek design with AirSlim.', image_url: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800', specs: { screen_size: '55"', resolution: '4K UHD', smart_platform: 'Tizen', hdr: 'HDR10+' } },
    { name: 'LG 1.0HP Split Type Air Conditioner HS10IPK', category: 'Air Conditioners', brand: 'LG', base_price: 28999, description: '1.0HP split type air conditioner with Dual Inverter technology, fast cooling, and low noise operation.', image_url: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=800', specs: { hp: '1.0HP', type: 'Split Type', inverter: 'Dual Inverter', btu: '9800 BTU' } },
    { name: 'Whirlpool 2-Door Refrigerator WRM430S', category: 'Refrigerators', brand: 'Whirlpool', base_price: 37999, description: '430L 2-door refrigerator with 6th Sense technology and humidity-controlled crisper.', image_url: 'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=800', specs: { capacity: '430L', type: '2-Door', technology: '6th Sense' } },
    { name: 'Panasonic 10kg Washing Machine NA-FS10X2', category: 'Washing Machines', brand: 'Panasonic', base_price: 18999, description: '10kg top-load washing machine with Stain Master+ and Active Foam technology.', image_url: 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=800', specs: { capacity: '10kg', type: 'Top Load', technology: 'Active Foam' } },
    { name: 'Sharp 2.0HP Window Type Air Conditioner AF-S20KK', category: 'Air Conditioners', brand: 'Sharp', base_price: 32500, description: '2.0HP window type air conditioner with Plasmacluster air purification and eco mode.', image_url: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=800', specs: { hp: '2.0HP', type: 'Window Type', purification: 'Plasmacluster' } },
    { name: 'Samsung 32" HD Smart TV UA32T5300', category: 'Televisions & Audio', brand: 'Samsung', base_price: 18999, description: '32-inch HD ready smart TV with PurColor and Dolby Audio.', image_url: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800', specs: { screen_size: '32"', resolution: 'HD', smart_platform: 'Tizen' } },
    { name: 'Midea 1.5HP Inverter Window Type AC MWW-12CRF8', category: 'Air Conditioners', brand: 'Midea', base_price: 27999, description: '1.5HP window type inverter air conditioner with energy-saving mode.', image_url: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=800', specs: { hp: '1.5HP', type: 'Window Type', inverter: 'Yes' } },
    { name: 'Toshiba 7kg Front Load Washing Machine TWF-BK70M2', category: 'Washing Machines', brand: 'Toshiba', base_price: 24999, description: '7kg front load washer with steam technology and inverter motor.', image_url: 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=800', specs: { capacity: '7kg', type: 'Front Load', motor: 'Inverter' } },
    { name: 'Condura 8.1 Cu.ft. Refrigerator CFC801', category: 'Refrigerators', brand: 'Condura', base_price: 28999, description: '8.1 cu.ft. single-door refrigerator with freezer compartment.', image_url: 'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=800', specs: { capacity: '8.1 cu.ft.', type: 'Single Door' } },
    { name: 'LG 43" 4K Smart TV 43UP7750', category: 'Televisions & Audio', brand: 'LG', base_price: 32999, description: '43-inch 4K UHD smart TV with webOS 22 and AI ThinQ.', image_url: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800', specs: { screen_size: '43"', resolution: '4K UHD', os: 'webOS 22' } },
    { name: 'American Home 1.5HP Window Type AC AW-12K', category: 'Air Conditioners', brand: 'American Home', base_price: 19999, description: 'Affordable 1.5HP window type air conditioner with turbo cooling.', image_url: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=800', specs: { hp: '1.5HP', type: 'Window Type', cooling: 'Turbo' } },
    { name: 'Fujidenzo 8kg Washing Machine FWM-8000', category: 'Washing Machines', brand: 'Fujidenzo', base_price: 15999, description: '8kg fully automatic washing machine with 8 wash programs.', image_url: 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=800', specs: { capacity: '8kg', type: 'Fully Automatic' } },
    { name: 'Sharp 65" 4K Smart TV 4T-C65GN1', category: 'Televisions & Audio', brand: 'Sharp', base_price: 74999, description: '65-inch 4K Android Smart TV with Google Assistant built-in.', image_url: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800', specs: { screen_size: '65"', resolution: '4K UHD', os: 'Android TV' } },
  ];

  for (const p of products) {
    const slug = slugify(p.name);
    const { data: existing } = await supabase.from('products').select('id').eq('slug', slug).single();
    if (!existing) {
      await supabase.from('products').insert({
        name: p.name,
        slug,
        description: p.description,
        base_price: p.base_price,
        image_url: p.image_url,
        specifications: p.specs,
        category_id: categoryMap[p.category],
        brand_id: brandMap[p.brand],
      });
    }
  }
  console.log('Products seeded');
}

async function seedVariants(supabase: any, productMap: Record<string, string>) {
  for (const [slug, productId] of Object.entries(productMap)) {
    const { data: existing } = await supabase.from('product_variants').select('id').eq('product_id', productId).single();
    if (existing) continue;

    await supabase.from('product_variants').insert({
      product_id: productId,
      sku: `SKU-${slug.slice(0, 10).toUpperCase()}-STD`,
      price: 0,
      attributes: { type: 'Standard' },
    });
  }
  console.log('Variants seeded');
}

export async function seedDatabase() {
  const supabase = await createClient();

  try {
    await seedCategories(supabase);
    await seedBrands(supabase);

    const { data: categories } = await supabase.from('categories').select('id, name');
    const { data: brands } = await supabase.from('brands').select('id, name');
    const categoryMap: Record<string, string> = {};
    const brandMap: Record<string, string> = {};
    for (const c of categories || []) categoryMap[c.name] = c.id;
    for (const b of brands || []) brandMap[b.name] = b.id;

    await seedProducts(supabase, categoryMap, brandMap);

    const { data: products } = await supabase.from('products').select('id, slug');
    const productMap: Record<string, string> = {};
    for (const p of products || []) productMap[p.slug] = p.id;

    await seedVariants(supabase, productMap);

    revalidatePath('/admin');
    revalidatePath('/products');
    return { success: true, message: 'Database seeded successfully!' };
  } catch (error) {
    console.error('Seed error:', error);
    return { success: false, message: error instanceof Error ? error.message : 'Seed failed' };
  }
}
