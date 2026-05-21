/* eslint-disable @typescript-eslint/no-explicit-any */
import { getAllInventory, getProductsForInventory, getWarehouses, getTransfers, getVendors, getPurchaseOrders } from '@/app/actions/inventory';
import { InventoryClient } from './InventoryClient';

export default async function AdminInventoryPage() {
  const [invRes, productsRes, warehousesRes, transfersRes, vendorsRes, poRes] = await Promise.all([
    getAllInventory(),
    getProductsForInventory(),
    getWarehouses(),
    getTransfers(),
    getVendors(),
    getPurchaseOrders(),
  ]);

  return (
    <InventoryClient
      initialInventory={invRes.success ? (invRes.data || []) : []}
      initialProducts={productsRes.success ? (productsRes.data || []) : []}
      initialWarehouses={warehousesRes.success ? (warehousesRes.data || []) : []}
      initialTransfers={transfersRes.success ? (transfersRes.data || []) : []}
      initialVendors={vendorsRes.success ? (vendorsRes.data || []) : []}
      initialPurchaseOrders={poRes.success ? (poRes.data || []) : []}
    />
  );
}
