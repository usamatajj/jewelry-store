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
  Plus,
  Edit,
  Trash2,
  Eye,
  Upload,
  BarChart3,
  Search,
  Filter,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Product, Category } from '@/types';
import { createClient } from '@/lib/supabase-client';
import ProductForm from '@/components/admin/ProductForm';
import CategoryForm from '@/components/admin/CategoryForm';
import { toast } from 'sonner';

export default function AdminPage() {
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
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
  const totalRevenue = orders.reduce(
    (sum, order) => sum + (order.total_amount || 0),
    0
  );

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
      value: `$${totalRevenue.toFixed(2)}`,
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
                  <p className="text-sm font-medium text-gray-600">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
                <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <stat.icon className="h-6 w-6 text-primary" />
                </div>
              </div>
              <div className="mt-4">
                <Badge
                  variant={
                    stat.changeType === 'positive' ? 'default' : 'secondary'
                  }
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
                      <ProductForm
                        categories={categories}
                        onSuccess={loadData}
                      />
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
                            {product.image_url ? (
                              <img
                                src={product.image_url}
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
                              ${product.price}
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
                    <CategoryForm
                      categories={categories}
                      onSuccess={loadData}
                    />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categories.map((category) => (
                      <div
                        key={category.id}
                        className="p-4 border rounded-lg hover:bg-gray-50"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium">{category.name}</h3>
                            <p className="text-sm text-gray-600">
                              {category.slug}
                            </p>
                            <p className="text-xs text-gray-500">
                              {category.parent_id
                                ? 'Subcategory'
                                : 'Main Category'}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <CategoryForm
                              category={category}
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
                      </div>
                    ))}
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
                    <div
                      key={order.id}
                      className="p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">
                            Order #{order.id.slice(0, 8)}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {order.customer_name} - {order.customer_email}
                          </p>
                          <p className="text-sm text-gray-500">
                            {new Date(order.created_at).toLocaleDateString()}
                          </p>
                          <p className="text-sm font-medium text-primary">
                            ${order.total_amount}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge
                            variant={
                              order.status === 'completed'
                                ? 'default'
                                : 'secondary'
                            }
                          >
                            {order.status}
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
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No users yet
                  </h3>
                  <p className="text-gray-600">
                    User accounts will appear here once customers sign up
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {users.map((user) => (
                    <div
                      key={user.id}
                      className="p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">{user.email}</h3>
                          <p className="text-sm text-gray-600">
                            Role: {user.role}
                          </p>
                          <p className="text-sm text-gray-500">
                            Joined:{' '}
                            {new Date(user.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge
                            variant={
                              user.role === 'admin' ? 'default' : 'secondary'
                            }
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
