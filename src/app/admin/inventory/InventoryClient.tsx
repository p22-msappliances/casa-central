/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import { Plus, Search, Loader2, ArrowUp, ArrowDown, Package, Truck, ArrowRightLeft, Clock, CheckCircle, XCircle, AlertCircle, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  getAllInventory,
  addInventory,
  adjustInventory,
  getProductsForInventory,
  getWarehouses,
  createTransfer,
  getTransfers,
  updateTransferStatus,
  getVendors,
  createVendor,
  updateVendor,
  deleteVendor,
  getPurchaseOrders,
  createPurchaseOrder,
  updatePOStatus,
  deletePurchaseOrder,
  createWarehouse,
  updateWarehouse,
  deleteWarehouse,
} from "@/app/actions/inventory";

interface InventoryClientProps {
  initialInventory: any[];
  initialProducts: any[];
  initialWarehouses: any[];
  initialTransfers: any[];
  initialVendors: any[];
  initialPurchaseOrders: any[];
}

export function InventoryClient({
  initialInventory,
  initialProducts,
  initialWarehouses,
  initialTransfers,
  initialVendors,
  initialPurchaseOrders,
}: InventoryClientProps) {
  const [inventory, setInventory] = useState(initialInventory);
  const [products, setProducts] = useState(initialProducts);
  const [warehouses, setWarehouses] = useState(initialWarehouses);
  const [transfers, setTransfers] = useState(initialTransfers);
  const [vendors, setVendors] = useState(initialVendors);
  const [purchaseOrders, setPurchaseOrders] = useState(initialPurchaseOrders);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isTransferDialogOpen, setIsTransferDialogOpen] = useState(false);
  const [isVendorDialogOpen, setIsVendorDialogOpen] = useState(false);
  const [isPODialogOpen, setIsPODialogOpen] = useState(false);
  const [isWarehouseDialogOpen, setIsWarehouseDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingVendor, setEditingVendor] = useState<any>(null);
  const [editingWarehouse, setEditingWarehouse] = useState<any>(null);
  const [formData, setFormData] = useState({
    variant_id: "",
    warehouse_id: "",
    quantity: 0,
    low_stock_threshold: 10,
  });
  const [transferData, setTransferData] = useState({
    from_warehouse_id: "",
    to_warehouse_id: "",
    items: [] as { variant_id: string; quantity: number }[],
    notes: "",
  });
  const [vendorData, setVendorData] = useState({
    name: "",
    contact_email: "",
    contact_phone: "",
    address: "",
    notes: "",
  });
  const [warehouseData, setWarehouseData] = useState({
    name: "",
    location: "",
    is_virtual: false,
  });
  const [poData, setPOData] = useState({
    vendor_id: "",
    warehouse_id: "",
    items: [] as { variant_id: string; quantity: number; unit_cost: number }[],
    expected_date: "",
    notes: "",
  });

  async function refetchAll() {
    const [invRes, productsRes, warehousesRes, transfersRes, vendorsRes, poRes] = await Promise.all([
      getAllInventory(),
      getProductsForInventory(),
      getWarehouses(),
      getTransfers(),
      getVendors(),
      getPurchaseOrders(),
    ]);

    if (invRes.success) setInventory(invRes.data || []);
    if (productsRes.success) setProducts(productsRes.data || []);
    if (warehousesRes.success) setWarehouses(warehousesRes.data || []);
    if (transfersRes.success) setTransfers(transfersRes.data || []);
    if (vendorsRes.success) setVendors(vendorsRes.data || []);
    if (poRes.success) setPurchaseOrders(poRes.data || []);
  }

  // Inventory handlers
  async function handleSaveInventory() {
    if (!formData.variant_id || !formData.warehouse_id) {
      toast.error("Please select a product variant and warehouse");
      return;
    }
    setIsSaving(true);
    try {
      const result = await addInventory(formData);
      if (result.success) {
        toast.success("Inventory updated");
        setIsDialogOpen(false);
        setFormData({ variant_id: "", warehouse_id: "", quantity: 0, low_stock_threshold: 10 });
        await refetchAll();
      } else {
        toast.error(result.error || "Operation failed");
      }
    } catch (error) {
      toast.error("Operation failed");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleAdjust(id: string, change: number) {
    const result = await adjustInventory(id, change);
    if (result.success) {
      toast.success(change > 0 ? `Added ${change} units` : `Removed ${Math.abs(change)} units`);
      await refetchAll();
    } else {
      toast.error(result.error || "Failed to adjust inventory");
    }
  }

  // Transfer handlers
  async function handleCreateTransfer() {
    if (!transferData.from_warehouse_id || !transferData.to_warehouse_id) {
      toast.error("Please select source and destination warehouses");
      return;
    }
    if (transferData.items.length === 0) {
      toast.error("Please add at least one item to transfer");
      return;
    }
    setIsSaving(true);
    try {
      const result = await createTransfer(transferData);
      if (result.success) {
        toast.success("Transfer created successfully");
        setIsTransferDialogOpen(false);
        setTransferData({ from_warehouse_id: "", to_warehouse_id: "", items: [], notes: "" });
        await refetchAll();
      } else {
        toast.error(result.error || "Failed to create transfer");
      }
    } catch (error) {
      toast.error("Operation failed");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleTransferStatus(transferId: string, status: string) {
    const result = await updateTransferStatus(transferId, status as any);
    if (result.success) {
      toast.success(`Transfer ${status.toLowerCase()}`);
      await refetchAll();
    } else {
      toast.error(result.error || "Failed to update transfer");
    }
  }

  const addItemToTransfer = () => {
    setTransferData(prev => ({
      ...prev,
      items: [...prev.items, { variant_id: "", quantity: 1 }],
    }));
  };

  const removeItemFromTransfer = (index: number) => {
    setTransferData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const updateTransferItem = (index: number, field: string, value: any) => {
    setTransferData(prev => {
      const newItems = [...prev.items];
      newItems[index] = { ...newItems[index], [field]: value };
      return { ...prev, items: newItems };
    });
  };

  // Vendor handlers
  async function handleSaveVendor() {
    if (!vendorData.name) {
      toast.error("Vendor name is required");
      return;
    }
    setIsSaving(true);
    try {
      const result = editingVendor
        ? await updateVendor(editingVendor.id, vendorData)
        : await createVendor(vendorData);
      if (result.success) {
        toast.success(editingVendor ? "Vendor updated" : "Vendor created");
        setIsVendorDialogOpen(false);
        setEditingVendor(null);
        setVendorData({ name: "", contact_email: "", contact_phone: "", address: "", notes: "" });
        await refetchAll();
      } else {
        toast.error(result.error || "Operation failed");
      }
    } catch (error) {
      toast.error("Operation failed");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeleteVendor(id: string) {
    if (!confirm("Delete this vendor? This cannot be undone.")) return;
    const result = await deleteVendor(id);
    if (result.success) {
      toast.success("Vendor deleted");
      await refetchAll();
    } else {
      toast.error(result.error || "Failed to delete vendor");
    }
  }

  // Purchase Order handlers
  async function handleCreatePO() {
    if (!poData.vendor_id || !poData.warehouse_id) {
      toast.error("Please select vendor and warehouse");
      return;
    }
    if (poData.items.length === 0) {
      toast.error("Please add at least one item");
      return;
    }
    setIsSaving(true);
    try {
      const result = await createPurchaseOrder(poData);
      if (result.success) {
        toast.success("Purchase order created");
        setIsPODialogOpen(false);
        setPOData({ vendor_id: "", warehouse_id: "", items: [], expected_date: "", notes: "" });
        await refetchAll();
      } else {
        toast.error(result.error || "Failed to create purchase order");
      }
    } catch (error) {
      toast.error("Operation failed");
    } finally {
      setIsSaving(false);
    }
  }

  async function handlePOStatus(poId: string, status: string) {
    const result = await updatePOStatus(poId, status as any);
    if (result.success) {
      toast.success(`PO ${status.toLowerCase()}`);
      await refetchAll();
    } else {
      toast.error(result.error || "Failed to update PO");
    }
  }

  async function handleDeletePO(poId: string) {
    if (!confirm("Delete this purchase order?")) return;
    const result = await deletePurchaseOrder(poId);
    if (result.success) {
      toast.success("PO deleted");
      await refetchAll();
    } else {
      toast.error(result.error || "Failed to delete PO");
    }
  }

  const addItemToPO = () => {
    setPOData(prev => ({
      ...prev,
      items: [...prev.items, { variant_id: "", quantity: 1, unit_cost: 0 }],
    }));
  };

  const removeItemFromPO = (index: number) => {
    setPOData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const updatePOItem = (index: number, field: string, value: any) => {
    setPOData(prev => {
      const newItems = [...prev.items];
      newItems[index] = { ...newItems[index], [field]: value };
      return { ...prev, items: newItems };
    });
  };

  // Warehouse handlers
  async function handleSaveWarehouse() {
    if (!warehouseData.name) {
      toast.error("Warehouse name is required");
      return;
    }
    setIsSaving(true);
    try {
      const result = editingWarehouse
        ? await updateWarehouse(editingWarehouse.id, warehouseData)
        : await createWarehouse(warehouseData);
      if (result.success) {
        toast.success(editingWarehouse ? "Warehouse updated" : "Warehouse created");
        setIsWarehouseDialogOpen(false);
        setEditingWarehouse(null);
        setWarehouseData({ name: "", location: "", is_virtual: false });
        await refetchAll();
      } else {
        toast.error(result.error || "Operation failed");
      }
    } catch (error) {
      toast.error("Operation failed");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeleteWarehouse(id: string) {
    if (!confirm("Delete this warehouse?")) return;
    const result = await deleteWarehouse(id);
    if (result.success) {
      toast.success("Warehouse deleted");
      await refetchAll();
    } else {
      toast.error(result.error || "Failed to delete warehouse");
    }
  }

  const filteredInventory = inventory.filter((item) => {
    const productName = (item.product_variants as any)?.products?.name || "";
    const sku = (item.product_variants as any)?.sku || "";
    const search = searchTerm.toLowerCase();
    return productName.toLowerCase().includes(search) || sku.toLowerCase().includes(search);
  });

  const physicalWarehouses = warehouses.filter(w => !w.is_virtual);
  const virtualWarehouses = warehouses.filter(w => w.is_virtual);

  const statusColors: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-800 border-yellow-200",
    IN_TRANSIT: "bg-blue-100 text-blue-800 border-blue-200",
    DELIVERED: "bg-green-100 text-green-800 border-green-200",
    CANCELLED: "bg-red-100 text-red-800 border-red-200",
    DRAFT: "bg-gray-100 text-gray-800 border-gray-200",
    ORDERED: "bg-indigo-100 text-indigo-800 border-indigo-200",
    SHIPPED: "bg-blue-100 text-blue-800 border-blue-200",
    RECEIVED: "bg-green-100 text-green-800 border-green-200",
  };

  const statusIcons: Record<string, React.ReactNode> = {
    PENDING: <Clock className="h-3 w-3" />,
    IN_TRANSIT: <Truck className="h-3 w-3" />,
    DELIVERED: <CheckCircle className="h-3 w-3" />,
    CANCELLED: <XCircle className="h-3 w-3" />,
    DRAFT: <Clock className="h-3 w-3" />,
    ORDERED: <ArrowRightLeft className="h-3 w-3" />,
    SHIPPED: <Truck className="h-3 w-3" />,
    RECEIVED: <CheckCircle className="h-3 w-3" />,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary font-heading">Inventory</h1>
          <p className="text-muted-foreground mt-1">Manage stock, vendors, purchases, and warehouses.</p>
        </div>
      </div>

      <Tabs defaultValue="inventory" className="space-y-4">
        <TabsList className="flex-wrap">
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="purchase-orders">Purchase Orders</TabsTrigger>
          <TabsTrigger value="transfers">Transfers</TabsTrigger>
          <TabsTrigger value="vendors">Vendors</TabsTrigger>
          <TabsTrigger value="warehouses">Warehouses</TabsTrigger>
        </TabsList>

        {/* INVENTORY TAB */}
        <TabsContent value="inventory" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search inventory..." className="pl-10" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            <Button className="rounded-full" onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" /> Add Inventory
            </Button>
          </div>

          {filteredInventory.length === 0 ? (
            <div className="rounded-xl bg-card border border-secondary/30 p-12 text-center">
              <Package className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground">No inventory items found.</p>
            </div>
          ) : (
            <div className="rounded-xl bg-card border border-secondary/30 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-muted-foreground border-b border-secondary/30 bg-secondary/20">
                      <th className="p-4 font-medium">Product</th>
                      <th className="p-4 font-medium">SKU</th>
                      <th className="p-4 font-medium">Warehouse</th>
                      <th className="p-4 font-medium">Vendor</th>
                      <th className="p-4 font-medium">Quantity</th>
                      <th className="p-4 font-medium">Low Stock</th>
                      <th className="p-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInventory.map((item) => {
                      const isLowStock = item.quantity <= (item.low_stock_threshold || 10);
                      return (
                        <tr key={item.id} className="border-b border-secondary/10 hover:bg-secondary/10 transition-colors">
                          <td className="p-4 font-medium text-primary">{(item.product_variants as any)?.products?.name || "Unknown"}</td>
                          <td className="p-4 text-muted-foreground font-mono text-xs">{(item.product_variants as any)?.sku || "-"}</td>
                          <td className="p-4 text-muted-foreground">
                            <div className="flex items-center gap-2">
                              {item.warehouses?.is_virtual && <Badge variant="outline" className="text-[10px]">Virtual</Badge>}
                              {item.warehouses?.name || item.warehouse_id}
                            </div>
                          </td>
                          <td className="p-4 text-muted-foreground">{item.vendors?.name || "-"}</td>
                          <td className="p-4">
                            <span className={`font-bold ${isLowStock ? "text-red-500" : "text-green-600"}`}>{item.quantity || 0}</span>
                          </td>
                          <td className="p-4 text-muted-foreground">{item.low_stock_threshold || 10}</td>
                          <td className="p-4">
                            <div className="flex items-center gap-1">
                              <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full text-green-600 hover:bg-green-50" onClick={() => handleAdjust(item.id, 10)}>
                                <ArrowUp className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full text-red-500 hover:bg-red-50" onClick={() => handleAdjust(item.id, -10)}>
                                <ArrowDown className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </TabsContent>

        {/* PURCHASE ORDERS TAB */}
        <TabsContent value="purchase-orders" className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground">Manage vendor orders and receiving.</p>
            <Button className="rounded-full" onClick={() => setIsPODialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" /> New Purchase Order
            </Button>
          </div>

          {purchaseOrders.length === 0 ? (
            <div className="rounded-xl bg-card border border-secondary/30 p-12 text-center">
              <Package className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground">No purchase orders yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {purchaseOrders.map((po) => {
                const totalCost = po.purchase_order_items?.reduce((sum: number, item: any) => sum + (item.total_cost || item.quantity * item.unit_cost), 0) || 0;
                return (
                  <div key={po.id} className="rounded-xl bg-card border border-secondary/30 p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-primary">PO-{po.id.slice(0, 8).toUpperCase()}</span>
                          <Badge className={statusColors[po.status] || ""}>
                            <span className="flex items-center gap-1">{statusIcons[po.status]}{po.status}</span>
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{po.vendors?.name} → {po.warehouses?.name}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {po.status === "DRAFT" && (
                          <>
                            <Button size="sm" variant="outline" onClick={() => handlePOStatus(po.id, "ORDERED")}>Place Order</Button>
                            <Button size="sm" variant="destructive" onClick={() => handleDeletePO(po.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        {po.status === "ORDERED" && (
                          <Button size="sm" variant="outline" onClick={() => handlePOStatus(po.id, "SHIPPED")}>Mark Shipped</Button>
                        )}
                        {po.status === "SHIPPED" && (
                          <Button size="sm" onClick={() => handlePOStatus(po.id, "RECEIVED")}>Receive Stock</Button>
                        )}
                      </div>
                    </div>

                    <div className="rounded-lg bg-muted/30 p-3">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-left text-muted-foreground">
                            <th className="pb-2 font-medium">Product</th>
                            <th className="pb-2 font-medium">SKU</th>
                            <th className="pb-2 font-medium text-right">Qty</th>
                            <th className="pb-2 font-medium text-right">Unit Cost</th>
                            <th className="pb-2 font-medium text-right">Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {po.purchase_order_items?.map((item: any) => (
                            <tr key={item.id} className="border-t border-secondary/10">
                              <td className="py-2">{(item.product_variants as any)?.products?.name || "Unknown"}</td>
                              <td className="py-2 font-mono text-xs">{(item.product_variants as any)?.sku || "-"}</td>
                              <td className="py-2 text-right">{item.quantity}</td>
                              <td className="py-2 text-right">${Number(item.unit_cost).toLocaleString()}</td>
                              <td className="py-2 text-right font-bold">${Number(item.total_cost || item.quantity * item.unit_cost).toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        {po.expected_date && `Expected: ${new Date(po.expected_date).toLocaleDateString()}`}
                      </span>
                      <span className="font-bold text-primary">Total: ${Number(totalCost).toLocaleString()}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* TRANSFERS TAB */}
        <TabsContent value="transfers" className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground">Move inventory between warehouses.</p>
            <Button variant="outline" className="rounded-full" onClick={() => setIsTransferDialogOpen(true)}>
              <ArrowRightLeft className="h-4 w-4 mr-2" /> New Transfer
            </Button>
          </div>

          {transfers.length === 0 ? (
            <div className="rounded-xl bg-card border border-secondary/30 p-12 text-center">
              <Truck className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground">No transfers found.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {transfers.map((transfer) => (
                <div key={transfer.id} className="rounded-xl bg-card border border-secondary/30 p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-primary">{transfer.from_warehouses?.name}</span>
                        <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium text-primary">{transfer.to_warehouses?.name}</span>
                      </div>
                      <Badge className={statusColors[transfer.status] || ""}>
                        <span className="flex items-center gap-1">{statusIcons[transfer.status]}{transfer.status}</span>
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      {transfer.status === "PENDING" && (
                        <>
                          <Button size="sm" variant="outline" onClick={() => handleTransferStatus(transfer.id, "IN_TRANSIT")}>Mark In Transit</Button>
                          <Button size="sm" variant="destructive" onClick={() => handleTransferStatus(transfer.id, "CANCELLED")}>Cancel</Button>
                        </>
                      )}
                      {transfer.status === "IN_TRANSIT" && (
                        <Button size="sm" onClick={() => handleTransferStatus(transfer.id, "DELIVERED")}>Mark Delivered</Button>
                      )}
                    </div>
                  </div>

                  <div className="rounded-lg bg-muted/30 p-3">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-muted-foreground">
                          <th className="pb-2 font-medium">Product</th>
                          <th className="pb-2 font-medium">SKU</th>
                          <th className="pb-2 font-medium text-right">Quantity</th>
                        </tr>
                      </thead>
                      <tbody>
                        {transfer.transfer_items?.map((item: any) => (
                          <tr key={item.id} className="border-t border-secondary/10">
                            <td className="py-2">{(item.product_variants as any)?.products?.name || "Unknown"}</td>
                            <td className="py-2 font-mono text-xs">{(item.product_variants as any)?.sku || "-"}</td>
                            <td className="py-2 text-right font-bold">{item.quantity}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* VENDORS TAB */}
        <TabsContent value="vendors" className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground">Manage your suppliers and vendors.</p>
            <Button className="rounded-full" onClick={() => { setEditingVendor(null); setVendorData({ name: "", contact_email: "", contact_phone: "", address: "", notes: "" }); setIsVendorDialogOpen(true); }}>
              <Plus className="h-4 w-4 mr-2" /> Add Vendor
            </Button>
          </div>

          {vendors.length === 0 ? (
            <div className="rounded-xl bg-card border border-secondary/30 p-12 text-center">
              <Package className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground">No vendors added yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {vendors.map((vendor) => (
                <div key={vendor.id} className="rounded-xl bg-card border border-secondary/30 p-5 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-primary">{vendor.name}</h3>
                      {!vendor.is_active && <Badge variant="secondary" className="mt-1">Inactive</Badge>}
                    </div>
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => { setEditingVendor(vendor); setVendorData({ name: vendor.name, contact_email: vendor.contact_email || "", contact_phone: vendor.contact_phone || "", address: vendor.address || "", notes: vendor.notes || "" }); setIsVendorDialogOpen(true); }}>
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => handleDeleteVendor(vendor.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                  {vendor.contact_email && <p className="text-sm text-muted-foreground">📧 {vendor.contact_email}</p>}
                  {vendor.contact_phone && <p className="text-sm text-muted-foreground">📞 {vendor.contact_phone}</p>}
                  {vendor.address && <p className="text-sm text-muted-foreground">📍 {vendor.address}</p>}
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* WAREHOUSES TAB */}
        <TabsContent value="warehouses" className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground">Manage physical and virtual warehouses.</p>
            <Button className="rounded-full" onClick={() => { setEditingWarehouse(null); setWarehouseData({ name: "", location: "", is_virtual: false }); setIsWarehouseDialogOpen(true); }}>
              <Plus className="h-4 w-4 mr-2" /> Add Warehouse
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-primary mb-3 flex items-center gap-2">
                <Package className="h-5 w-5" /> Physical Warehouses
              </h3>
              <div className="space-y-2">
                {physicalWarehouses.map((wh) => (
                  <div key={wh.id} className="p-4 rounded-xl bg-card border border-secondary/30 flex items-center justify-between">
                    <div>
                      <span className="font-medium text-primary">{wh.name}</span>
                      {wh.location && <p className="text-sm text-muted-foreground">{wh.location}</p>}
                    </div>
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => { setEditingWarehouse(wh); setWarehouseData({ name: wh.name, location: wh.location || "", is_virtual: wh.is_virtual }); setIsWarehouseDialogOpen(true); }}>
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => handleDeleteWarehouse(wh.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-primary mb-3 flex items-center gap-2">
                <AlertCircle className="h-5 w-5" /> Virtual Warehouses
              </h3>
              <div className="space-y-2">
                {virtualWarehouses.map((wh) => (
                  <div key={wh.id} className="p-4 rounded-xl bg-card border border-secondary/30 flex items-center justify-between">
                    <div>
                      <span className="font-medium text-primary">{wh.name}</span>
                      {wh.location && <p className="text-sm text-muted-foreground">{wh.location}</p>}
                    </div>
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => { setEditingWarehouse(wh); setWarehouseData({ name: wh.name, location: wh.location || "", is_virtual: true }); setIsWarehouseDialogOpen(true); }}>
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => handleDeleteWarehouse(wh.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* ADD INVENTORY DIALOG */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px] bg-card border-secondary/30 text-primary">
          <DialogHeader>
            <DialogTitle className="font-heading">Add Inventory</DialogTitle>
            <DialogDescription className="text-muted-foreground">Set stock levels for a product variant.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Product *</Label>
              <Select value={formData.variant_id} onValueChange={(value) => setFormData({ ...formData, variant_id: value || "" })}>
                <SelectTrigger><SelectValue placeholder="Select a product variant" /></SelectTrigger>
                <SelectContent>
                  {products.map((product) => product.product_variants?.map((variant: any) => (
                    <SelectItem key={variant.id} value={variant.id}>{product.name} ({variant.sku})</SelectItem>
                  )))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Warehouse *</Label>
              <Select value={formData.warehouse_id} onValueChange={(value) => setFormData({ ...formData, warehouse_id: value || "" })}>
                <SelectTrigger><SelectValue placeholder="Select a warehouse" /></SelectTrigger>
                <SelectContent>
                  {warehouses.map((wh) => (
                    <SelectItem key={wh.id} value={wh.id}>{wh.name} {wh.is_virtual ? "(Virtual)" : ""}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Quantity *</Label>
                <Input type="number" min="0" value={formData.quantity} onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })} />
              </div>
              <div className="grid gap-2">
                <Label>Low Stock Alert</Label>
                <Input type="number" min="0" value={formData.low_stock_threshold} onChange={(e) => setFormData({ ...formData, low_stock_threshold: parseInt(e.target.value) || 10 })} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSaving}>Cancel</Button>
            <Button onClick={handleSaveInventory} disabled={isSaving}>{isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* TRANSFER DIALOG */}
      <Dialog open={isTransferDialogOpen} onOpenChange={setIsTransferDialogOpen}>
        <DialogContent className="sm:max-w-[600px] bg-card border-secondary/30 text-primary max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-heading">Create Transfer</DialogTitle>
            <DialogDescription className="text-muted-foreground">Transfer inventory between warehouses.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>From Warehouse *</Label>
                <Select value={transferData.from_warehouse_id} onValueChange={(value) => setTransferData({ ...transferData, from_warehouse_id: value || "" })}>
                  <SelectTrigger><SelectValue placeholder="Source" /></SelectTrigger>
                  <SelectContent>
                    {physicalWarehouses.map((wh) => (<SelectItem key={wh.id} value={wh.id}>{wh.name}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>To Warehouse *</Label>
                <Select value={transferData.to_warehouse_id} onValueChange={(value) => setTransferData({ ...transferData, to_warehouse_id: value || "" })}>
                  <SelectTrigger><SelectValue placeholder="Destination" /></SelectTrigger>
                  <SelectContent>
                    {warehouses.map((wh) => (<SelectItem key={wh.id} value={wh.id}>{wh.name} {wh.is_virtual ? "(Virtual)" : ""}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Items</Label>
                <Button size="sm" variant="outline" onClick={addItemToTransfer}><Plus className="h-3 w-3 mr-1" />Add</Button>
              </div>
              {transferData.items.map((item, index) => (
                <div key={index} className="flex gap-2 items-start">
                  <Select value={item.variant_id} onValueChange={(value) => updateTransferItem(index, "variant_id", value)}>
                    <SelectTrigger className="flex-1"><SelectValue placeholder="Variant" /></SelectTrigger>
                    <SelectContent>
                      {products.map((product) => product.product_variants?.map((variant: any) => (
                        <SelectItem key={variant.id} value={variant.id}>{product.name} ({variant.sku})</SelectItem>
                      )))}
                    </SelectContent>
                  </Select>
                  <Input type="number" min="1" className="w-24" value={item.quantity} onChange={(e) => updateTransferItem(index, "quantity", parseInt(e.target.value) || 1)} />
                  <Button size="icon" variant="ghost" className="text-destructive" onClick={() => removeItemFromTransfer(index)}><XCircle className="h-4 w-4" /></Button>
                </div>
              ))}
            </div>
            <div className="grid gap-2">
              <Label>Notes</Label>
              <Textarea placeholder="Transfer notes..." value={transferData.notes} onChange={(e) => setTransferData({ ...transferData, notes: e.target.value })} rows={2} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTransferDialogOpen(false)} disabled={isSaving}>Cancel</Button>
            <Button onClick={handleCreateTransfer} disabled={isSaving}>{isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Create Transfer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* VENDOR DIALOG */}
      <Dialog open={isVendorDialogOpen} onOpenChange={setIsVendorDialogOpen}>
        <DialogContent className="sm:max-w-[500px] bg-card border-secondary/30 text-primary">
          <DialogHeader>
            <DialogTitle className="font-heading">{editingVendor ? "Edit Vendor" : "Add Vendor"}</DialogTitle>
            <DialogDescription className="text-muted-foreground">Vendor details.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Name *</Label>
              <Input value={vendorData.name} onChange={(e) => setVendorData({ ...vendorData, name: e.target.value })} placeholder="e.g. GE Appliances" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Email</Label>
                <Input type="email" value={vendorData.contact_email} onChange={(e) => setVendorData({ ...vendorData, contact_email: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label>Phone</Label>
                <Input type="tel" value={vendorData.contact_phone} onChange={(e) => { const val = e.target.value; const digits = val.replace(/\D/g, ''); setVendorData({ ...vendorData, contact_phone: digits.length <= 3 ? digits : digits.length <= 6 ? `${digits.slice(0, 3)}-${digits.slice(3)}` : `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6, 10)}` }); }} onBlur={(e) => { const digits = e.target.value.replace(/\D/g, ''); let cleaned = digits; if (cleaned.length === 11 && cleaned.startsWith('1')) cleaned = cleaned.slice(1); else if (cleaned.length === 11 && cleaned.startsWith('0')) cleaned = cleaned.slice(1); else if (cleaned.length === 12 && cleaned.startsWith('63')) cleaned = cleaned.slice(2); setVendorData({ ...vendorData, contact_phone: cleaned.length === 10 ? `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}` : digits }); }} />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Address</Label>
              <Input value={vendorData.address} onChange={(e) => setVendorData({ ...vendorData, address: e.target.value })} />
            </div>
            <div className="grid gap-2">
              <Label>Notes</Label>
              <Textarea value={vendorData.notes} onChange={(e) => setVendorData({ ...vendorData, notes: e.target.value })} rows={2} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsVendorDialogOpen(false)} disabled={isSaving}>Cancel</Button>
            <Button onClick={handleSaveVendor} disabled={isSaving}>{isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* PURCHASE ORDER DIALOG */}
      <Dialog open={isPODialogOpen} onOpenChange={setIsPODialogOpen}>
        <DialogContent className="sm:max-w-[600px] bg-card border-secondary/30 text-primary max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-heading">New Purchase Order</DialogTitle>
            <DialogDescription className="text-muted-foreground">Order inventory from a vendor.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Vendor *</Label>
                <Select value={poData.vendor_id} onValueChange={(value) => setPOData({ ...poData, vendor_id: value || "" })}>
                  <SelectTrigger><SelectValue placeholder="Select vendor" /></SelectTrigger>
                  <SelectContent>
                    {vendors.map((v) => (<SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Destination Warehouse *</Label>
                <Select value={poData.warehouse_id} onValueChange={(value) => setPOData({ ...poData, warehouse_id: value || "" })}>
                  <SelectTrigger><SelectValue placeholder="Select warehouse" /></SelectTrigger>
                  <SelectContent>
                    {physicalWarehouses.map((wh) => (<SelectItem key={wh.id} value={wh.id}>{wh.name}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Expected Date</Label>
              <Input type="date" value={poData.expected_date} onChange={(e) => setPOData({ ...poData, expected_date: e.target.value })} />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Items</Label>
                <Button size="sm" variant="outline" onClick={addItemToPO}><Plus className="h-3 w-3 mr-1" />Add</Button>
              </div>
              {poData.items.map((item, index) => (
                <div key={index} className="flex gap-2 items-start">
                  <Select value={item.variant_id} onValueChange={(value) => updatePOItem(index, "variant_id", value)}>
                    <SelectTrigger className="flex-1"><SelectValue placeholder="Variant" /></SelectTrigger>
                    <SelectContent>
                      {products.map((product) => product.product_variants?.map((variant: any) => (
                        <SelectItem key={variant.id} value={variant.id}>{product.name} ({variant.sku})</SelectItem>
                      )))}
                    </SelectContent>
                  </Select>
                  <Input type="number" min="1" className="w-20" placeholder="Qty" value={item.quantity} onChange={(e) => updatePOItem(index, "quantity", parseInt(e.target.value) || 1)} />
                  <Input type="number" min="0" className="w-28" placeholder="Cost" value={item.unit_cost} onChange={(e) => updatePOItem(index, "unit_cost", parseFloat(e.target.value) || 0)} />
                  <Button size="icon" variant="ghost" className="text-destructive" onClick={() => removeItemFromPO(index)}><XCircle className="h-4 w-4" /></Button>
                </div>
              ))}
            </div>
            <div className="grid gap-2">
              <Label>Notes</Label>
              <Textarea placeholder="PO notes..." value={poData.notes} onChange={(e) => setPOData({ ...poData, notes: e.target.value })} rows={2} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPODialogOpen(false)} disabled={isSaving}>Cancel</Button>
            <Button onClick={handleCreatePO} disabled={isSaving}>{isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Create PO</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* WAREHOUSE DIALOG */}
      <Dialog open={isWarehouseDialogOpen} onOpenChange={setIsWarehouseDialogOpen}>
        <DialogContent className="sm:max-w-[500px] bg-card border-secondary/30 text-primary">
          <DialogHeader>
            <DialogTitle className="font-heading">{editingWarehouse ? "Edit Warehouse" : "Add Warehouse"}</DialogTitle>
            <DialogDescription className="text-muted-foreground">Warehouse details.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Name *</Label>
              <Input value={warehouseData.name} onChange={(e) => setWarehouseData({ ...warehouseData, name: e.target.value })} placeholder="e.g. Main Warehouse" />
            </div>
            <div className="grid gap-2">
              <Label>Location</Label>
              <Input value={warehouseData.location} onChange={(e) => setWarehouseData({ ...warehouseData, location: e.target.value })} placeholder="e.g. 123 Main St, City" />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_virtual"
                checked={warehouseData.is_virtual}
                onChange={(e) => setWarehouseData({ ...warehouseData, is_virtual: e.target.checked })}
                className="rounded border-gray-300"
              />
              <Label htmlFor="is_virtual">Virtual Warehouse</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsWarehouseDialogOpen(false)} disabled={isSaving}>Cancel</Button>
            <Button onClick={handleSaveWarehouse} disabled={isSaving}>{isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
