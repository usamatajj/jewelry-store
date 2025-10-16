'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import {
  Package,
  Users,
  ShoppingCart,
  DollarSign,
  Edit,
  Eye,
  BarChart3,
  Search,
  CheckCircle,
  CreditCard,
  Loader2,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Product, Category } from '@/types';
import { createClient } from '@/lib/supabase-client';
import ProductForm from '@/components/admin/ProductForm';
import CategoryForm from '@/components/admin/CategoryForm';

// Admin dashboard types
interface AdminOrder {
  id: string;
  user_id: string | null;
  email: string;
  first_name: string;
  last_name: string;
  total_amount: number;
  status: string;
  payment_status: string;
  payment_method: string;
  created_at: string;
  order_items?: unknown[];
}

interface AdminUser {
  id: string;
  email: string;
  role: string;
  created_at: string;
}

// OrderRow Component
function OrderRow({ order, onUpdate }: { order: AdminOrder; onUpdate: () => void }) {
  const [isConfirming, setIsConfirming] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const handleConfirmOrder = async () => {
    setIsConfirming(true);
    try {
      const response = await fetch(`/api/admin/orders/${order.id}/confirm`, {
        method: 'POST',
      });

      const data = await response.json();

      if (response.ok) {
        alert('Order confirmed successfully! Confirmation email sent to customer.');
        onUpdate(); // Reload orders
      } else {
        alert(`Failed to confirm order: ${data.error}`);
      }
    } catch (error) {
      console.error('Error confirming order:', error);
      alert('Failed to confirm order');
    } finally {
      setIsConfirming(false);
    }
  };

  const handleVerifyPayment = async () => {
    setIsVerifying(true);
    try {
      const response = await fetch(`/api/admin/orders/${order.id}/verify-payment`, {
        method: 'POST',
      });

      const data = await response.json();

      if (response.ok) {
        alert('Payment verified successfully! Verification email sent to customer.');
        onUpdate(); // Reload orders
      } else {
        alert(`Failed to verify payment: ${data.error}`);
      }
    } catch (error) {
      console.error('Error verifying payment:', error);
      alert('Failed to verify payment');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleUpdateStatus = async (newStatus: string) => {
    setIsUpdatingStatus(true);
    try {
      const response = await fetch(`/api/admin/orders/${order.id}/update-status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();

      if (response.ok) {
        alert(`Order status updated to ${newStatus}!`);
        onUpdate(); // Reload orders
      } else {
        alert(`Failed to update status: ${data.error}`);
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'refunded':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Helper function to get order status message
  const getOrderStatusMessage = () => {
    if (order.payment_method === 'bank_transfer') {
      if (order.payment_status === 'pending' && order.status === 'pending') {
        return '⏳ Awaiting payment verification';
      }
      if (order.payment_status === 'paid' && order.status === 'pending') {
        return '✅ Payment verified - Ready to confirm';
      }
    }
    if (order.payment_method === 'cash_on_delivery') {
      if (order.status === 'pending') {
        return '📞 COD - Ready to confirm';
      }
      if (order.status === 'processing') {
        return '📦 COD - Being prepared';
      }
    }
    return null;
  };

  return (
    <div className="p-4 border rounded-lg hover:bg-gray-50">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-medium text-lg">#{order.id.slice(0, 8).toUpperCase()}</h3>

            {/* Order Status Badge with label */}
            <div className="flex items-center gap-1">
              <span className="text-xs text-gray-500 font-medium">Order:</span>
              <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
            </div>

            {/* Payment Status Badge with label */}
            <div className="flex items-center gap-1">
              <span className="text-xs text-gray-500 font-medium">Payment:</span>
              <Badge className={getPaymentStatusColor(order.payment_status)}>
                {order.payment_status}
              </Badge>
            </div>

            {/* Payment Method Badge */}
            <Badge variant="outline" className="text-xs">
              {order.payment_method === 'bank_transfer' ? '🏦 Bank Transfer' : '💰 COD'}
            </Badge>
          </div>

          {/* Status Message */}
          {getOrderStatusMessage() && (
            <div className="mb-2 text-sm font-medium text-blue-600">
              {getOrderStatusMessage()}
            </div>
          )}

          <p className="text-sm text-gray-600">
            <strong>
              {order.first_name} {order.last_name}
            </strong>{' '}
            - {order.email}
          </p>
          <p className="text-sm text-gray-500">
            {new Date(order.created_at).toLocaleDateString('en-US', {
              weekday: 'short',
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
          <p className="text-sm font-medium text-primary mt-1">
            Rs {order.total_amount.toLocaleString('en-PK')}
          </p>
        </div>

        <div className="flex flex-col gap-2">
          {/* Confirm Order Button (pending → processing) */}
          {order.status === 'pending' && (
            <Button
              size="sm"
              onClick={handleConfirmOrder}
              disabled={isConfirming}
              className="bg-green-600 hover:bg-green-700"
            >
              {isConfirming ? (
                <>
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  Confirming...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Confirm Order
                </>
              )}
            </Button>
          )}

          {/* Verify Payment Button (for bank transfer with pending payment) */}
          {order.payment_status === 'pending' &&
            order.payment_method === 'bank_transfer' && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleVerifyPayment}
                disabled={isVerifying}
                className="border-blue-600 text-blue-600 hover:bg-blue-50"
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4 mr-1" />
                    Verify Payment
                  </>
                )}
              </Button>
            )}

          {/* Mark as Shipped Button (processing → shipped) */}
          {order.status === 'processing' && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleUpdateStatus('shipped')}
              disabled={isUpdatingStatus}
              className="border-purple-600 text-purple-600 hover:bg-purple-50"
            >
              {isUpdatingStatus ? (
                <>
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  Updating...
                </>
              ) : (
                <>📦 Mark as Shipped</>
              )}
            </Button>
          )}

          {/* Mark as Delivered Button (shipped → delivered) */}
          {order.status === 'shipped' && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleUpdateStatus('delivered')}
              disabled={isUpdatingStatus}
              className="border-green-600 text-green-600 hover:bg-green-50"
            >
              {isUpdatingStatus ? (
                <>
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  Updating...
                </>
              ) : (
                <>✅ Mark as Delivered</>
              )}
            </Button>
          )}

          {/* Mark Payment as Paid for COD (when delivered) */}
          {order.status === 'delivered' &&
            order.payment_status === 'pending' &&
            order.payment_method === 'cash_on_delivery' && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleVerifyPayment}
                disabled={isVerifying}
                className="border-green-600 text-green-600 hover:bg-green-50"
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    Marking...
                  </>
                ) : (
                  <>💰 Mark Payment Received</>
                )}
              </Button>
            )}

          {/* Cancel Order Button (only if pending or processing) */}
          {(order.status === 'pending' || order.status === 'processing') && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                if (
                  confirm(
                    'Are you sure you want to cancel this order? This action cannot be undone.'
                  )
                ) {
                  handleUpdateStatus('cancelled');
                }
              }}
              disabled={isUpdatingStatus}
              className="border-red-600 text-red-600 hover:bg-red-50"
            >
              {isUpdatingStatus ? (
                <>
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  Cancelling...
                </>
              ) : (
                <>❌ Cancel Order</>
              )}
            </Button>
          )}

          {/* View Details Button */}
          <Button variant="outline" size="sm">
            <Eye className="h-4 w-4 mr-1" />
            Details
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/admin/login');
        return;
      }
      if (!isAdmin) {
        router.push('/');
        return;
      }
      loadData();
    }
  }, [user, isAdmin, loading, router]);

  const loadData = async () => {
    try {
      const supabase = await createClient();

      // Load products
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select(
          `
          *,
          category:categories(*)
        `
        )
        .order('created_at', { ascending: false });

      if (productsError) {
        console.error('Error loading products:', productsError);
      } else {
        setProducts(productsData || []);
      }

      // Load categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (categoriesError) {
        console.error('Error loading categories:', categoriesError);
      } else {
        setCategories(categoriesData || []);
      }

      // Load orders
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select(
          `
          *,
          order_items:order_items(*)
        `
        )
        .order('created_at', { ascending: false });

      if (ordersError) {
        console.error('Error loading orders:', ordersError);
      } else {
        setOrders(ordersData || []);
      }

      // Load users
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (usersError) {
        console.error('Error loading users:', usersError);
      } else {
        setUsers(usersData || []);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (loading || isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading admin dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  // Filter products based on search and category
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === 'all' || product.category_id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Calculate total revenue
  const totalRevenue = orders.reduce((sum, order) => sum + (order.total_amount || 0), 0);

  const stats = [
    {
      title: 'Total Products',
      value: products.length,
      icon: Package,
      change: '+12%',
      changeType: 'positive' as const,
    },
    {
      title: 'Total Categories',
      value: categories.length,
      icon: BarChart3,
      change: '+3',
      changeType: 'positive' as const,
    },
    {
      title: 'Total Orders',
      value: orders.length,
      icon: ShoppingCart,
      change: '0%',
      changeType: 'neutral' as const,
    },
    {
      title: 'Revenue',
      value: `Rs ${totalRevenue.toLocaleString('en-PK')}`,
      icon: DollarSign,
      change: '0%',
      changeType: 'neutral' as const,
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-gray-600">Manage your jewelry store</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
                <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <stat.icon className="h-6 w-6 text-primary" />
                </div>
              </div>
              <div className="mt-4">
                <Badge
                  variant={stat.changeType === 'positive' ? 'default' : 'secondary'}
                  className="text-xs"
                >
                  {stat.change}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content */}
      <Tabs defaultValue="products" className="space-y-6">
        <TabsList>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
        </TabsList>

        {/* Products Tab */}
        <TabsContent value="products">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Products ({filteredProducts.length})</CardTitle>
                <ProductForm categories={categories} onSuccess={loadData} />
              </div>
            </CardHeader>
            <CardContent>
              {/* Search and Filter */}
              <div className="flex gap-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search products..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="w-48">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="all">All Categories</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                {filteredProducts.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {searchTerm || selectedCategory !== 'all'
                        ? 'No products found'
                        : 'No products yet'}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {searchTerm || selectedCategory !== 'all'
                        ? 'Try adjusting your search or filter criteria'
                        : 'Get started by adding your first product'}
                    </p>
                    {!searchTerm && selectedCategory === 'all' && (
                      <ProductForm categories={categories} onSuccess={loadData} />
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredProducts.map((product) => (
                      <div
                        key={product.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                            {product.images && product.images.length > 0 ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={product.images[0]}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Package className="h-8 w-8 text-gray-400" />
                            )}
                          </div>
                          <div>
                            <h3 className="font-medium">{product.name}</h3>
                            <p className="text-sm text-gray-600">
                              {product.category?.name}
                            </p>
                            <p className="text-sm font-medium text-primary">
                              Rs {product.price.toLocaleString('en-PK')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              window.open(`/products/${product.slug}`, '_blank')
                            }
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <ProductForm
                            product={product}
                            categories={categories}
                            onSuccess={loadData}
                            trigger={
                              <Button variant="outline" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                            }
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Categories Tab */}
        <TabsContent value="categories">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Categories ({categories.length})</CardTitle>
                <CategoryForm categories={categories} onSuccess={loadData} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {categories.length === 0 ? (
                  <div className="text-center py-12">
                    <BarChart3 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No categories yet
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Create categories to organize your products
                    </p>
                    <CategoryForm categories={categories} onSuccess={loadData} />
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Display parent categories with their children */}
                    {(() => {
                      const parentCategories = categories.filter((cat) => !cat.parent_id);
                      const childCategories = categories.filter((cat) => cat.parent_id);

                      return parentCategories.map((parent) => {
                        const children = childCategories.filter(
                          (child) => child.parent_id === parent.id
                        );

                        return (
                          <div key={parent.id} className="border rounded-lg p-4">
                            {/* Parent Category Header */}
                            <div className="flex items-center justify-between mb-4 pb-3 border-b">
                              <div>
                                <h3 className="text-lg font-semibold">{parent.name}</h3>
                                <p className="text-sm text-gray-600">
                                  {parent.slug} • Main Category
                                </p>
                              </div>
                              <CategoryForm
                                category={parent}
                                categories={categories}
                                onSuccess={loadData}
                                trigger={
                                  <Button variant="outline" size="sm">
                                    <Edit className="h-4 w-4 mr-1" />
                                    Edit
                                  </Button>
                                }
                              />
                            </div>

                            {/* Subcategories */}
                            {children.length > 0 ? (
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {children.map((child) => (
                                  <div
                                    key={child.id}
                                    className="p-3 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors"
                                  >
                                    <div className="flex items-center justify-between">
                                      <div>
                                        <h4 className="font-medium text-sm">
                                          {child.name}
                                        </h4>
                                        <p className="text-xs text-gray-500">
                                          {child.slug}
                                        </p>
                                      </div>
                                      <CategoryForm
                                        category={child}
                                        categories={categories}
                                        onSuccess={loadData}
                                        trigger={
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 w-8 p-0"
                                          >
                                            <Edit className="h-3 w-3" />
                                          </Button>
                                        }
                                      />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm text-gray-500 italic">
                                No subcategories yet
                              </p>
                            )}
                          </div>
                        );
                      });
                    })()}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Orders Tab */}
        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle>Orders ({orders.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {orders.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingCart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No orders yet
                  </h3>
                  <p className="text-gray-600">
                    Orders will appear here once customers start purchasing
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <OrderRow key={order.id} order={order} onUpdate={loadData} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>Users ({users.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {users.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No users yet</h3>
                  <p className="text-gray-600">
                    User accounts will appear here once customers sign up
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {users.map((user) => (
                    <div key={user.id} className="p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">{user.email}</h3>
                          <p className="text-sm text-gray-600">Role: {user.role}</p>
                          <p className="text-sm text-gray-500">
                            Joined: {new Date(user.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge
                            variant={user.role === 'admin' ? 'default' : 'secondary'}
                          >
                            {user.role}
                          </Badge>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
