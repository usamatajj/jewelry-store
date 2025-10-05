'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Building2,
  Wallet,
  Upload,
  Truck,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { CheckoutForm } from '@/types';
import { toast } from 'sonner';
import { uploadPaymentScreenshot } from '@/lib/storage';

const checkoutSchema = z
  .object({
    // Personal Information
    firstName: z.string().min(2, 'First name must be at least 2 characters'),
    lastName: z.string().min(2, 'Last name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email address'),
    phone: z.string().min(10, 'Please enter a valid phone number'),

    // Billing Address
    address: z.string().min(5, 'Please enter a complete address'),
    city: z.string().min(2, 'Please enter a valid city'),
    state: z.string().min(2, 'Please enter a valid state/province'),
    zipCode: z.string().min(4, 'Please enter a valid postal code'),
    country: z.string().min(2, 'Please select a country'),

    // Delivery Address (optional)
    useDifferentDelivery: z.boolean().optional(),
    deliveryAddress: z.string().optional(),
    deliveryCity: z.string().optional(),
    deliveryState: z.string().optional(),
    deliveryZipCode: z.string().optional(),
    deliveryCountry: z.string().optional(),

    // Payment Information
    paymentMethod: z.enum(['bank_transfer', 'cash_on_delivery']),
    paymentScreenshot: z.any().optional(),
  })
  .refine(
    (data) => {
      // If bank transfer is selected, screenshot is required
      if (data.paymentMethod === 'bank_transfer') {
        return data.paymentScreenshot !== undefined && data.paymentScreenshot !== null;
      }
      return true;
    },
    {
      message: 'Please upload payment screenshot for bank transfer',
      path: ['paymentScreenshot'],
    }
  )
  .refine(
    (data) => {
      // If different delivery address is checked, all delivery fields are required
      if (data.useDifferentDelivery) {
        return (
          data.deliveryAddress &&
          data.deliveryCity &&
          data.deliveryState &&
          data.deliveryZipCode
        );
      }
      return true;
    },
    {
      message: 'Please fill all delivery address fields',
      path: ['deliveryAddress'],
    }
  );

export default function CheckoutPage() {
  const { state, clearCart } = useCart();
  const { user } = useAuth(); // User can be null for guest checkout
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [paymentFile, setPaymentFile] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      email: user?.email || '', // Pre-fill email if user is logged in
      firstName: user?.user_metadata?.first_name || '',
      lastName: user?.user_metadata?.last_name || '',
      country: 'Pakistan',
      paymentMethod: 'bank_transfer',
      useDifferentDelivery: false,
    },
  });

  const paymentMethod = watch('paymentMethod');
  const useDifferentDelivery = watch('useDifferentDelivery');

  const formatPrice = (price: number) => {
    return `Rs ${price.toLocaleString('en-PK')}`;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file');
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      setPaymentFile(file);
      setValue('paymentScreenshot', file);
    }
  };

  const onSubmit = async (data: CheckoutForm) => {
    setIsProcessing(true);

    try {
      // Calculate totals
      const subtotal = state.items.reduce(
        (sum, item) => sum + item.product.price * item.quantity,
        0
      );
      const shipping = subtotal >= 5000 ? 0 : 200; // Free shipping above Rs 5000
      const codCharges = data.paymentMethod === 'cash_on_delivery' ? 100 : 0;
      const tax = 0; // No tax for now
      const total = subtotal + shipping + tax + codCharges;

      let paymentScreenshotUrl = null;

      // Upload payment screenshot if bank transfer
      if (data.paymentMethod === 'bank_transfer' && paymentFile) {
        toast.info('Uploading payment screenshot...');
        const uploadResult = await uploadPaymentScreenshot(paymentFile);
        paymentScreenshotUrl = uploadResult.url;
      }

      // Prepare delivery address
      const deliveryData = data.useDifferentDelivery
        ? {
            delivery_address: data.deliveryAddress,
            delivery_city: data.deliveryCity,
            delivery_state: data.deliveryState,
            delivery_zip_code: data.deliveryZipCode,
            delivery_country: data.deliveryCountry || 'Pakistan',
          }
        : {
            delivery_address: data.address,
            delivery_city: data.city,
            delivery_state: data.state,
            delivery_zip_code: data.zipCode,
            delivery_country: data.country,
          };

      // Create order (user_id can be null for guest checkout)
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user?.id || null, // null for guest checkout
          email: data.email,
          first_name: data.firstName,
          last_name: data.lastName,
          phone: data.phone,
          address: data.address,
          city: data.city,
          state: data.state,
          zip_code: data.zipCode,
          country: data.country,
          ...deliveryData,
          total_amount: total,
          payment_method: data.paymentMethod,
          payment_screenshot: paymentScreenshotUrl,
          items: state.items.map((item) => ({
            id: item.product.id,
            product_name: item.product.name,
            quantity: item.quantity,
            price: item.product.price,
          })),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create order');
      }

      const result = await response.json();
      setOrderNumber(result.order.id);
      setIsComplete(true);
      clearCart();
      toast.success('Order placed successfully!');
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error(
        `Failed to process order: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    } finally {
      setIsProcessing(false);
    }
  };

  // Show success message after order completion
  if (isComplete && orderNumber) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Order Confirmed!</h1>
            <p className="text-gray-600">
              Thank you for your order. We&apos;ll send you a confirmation email shortly.
            </p>
          </div>

          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Order Number</p>
                  <p className="text-lg font-mono font-semibold">
                    #{orderNumber.slice(0, 8).toUpperCase()}
                  </p>
                </div>
                <Separator />
                <div className="text-left space-y-2">
                  <h3 className="font-semibold">What&apos;s Next?</h3>
                  {paymentMethod === 'bank_transfer' ? (
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>✓ We&apos;ve received your payment screenshot</li>
                      <li>✓ Our team will verify your payment within 24 hours</li>
                      <li>✓ Once verified, we&apos;ll start processing your order</li>
                      <li>✓ You&apos;ll receive tracking information via email</li>
                    </ul>
                  ) : (
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>✓ Your order has been placed</li>
                      <li>✓ Prepare exact cash for delivery</li>
                      <li>✓ We&apos;ll call you to confirm the order</li>
                      <li>✓ Expected delivery within 3-5 business days</li>
                    </ul>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-4 justify-center">
            {user ? (
              <Link href="/orders">
                <Button variant="outline">View Orders</Button>
              </Link>
            ) : (
              <Link href="/auth/signin">
                <Button variant="outline">Sign In to Track Order</Button>
              </Link>
            )}
            <Link href="/">
              <Button>Continue Shopping</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Redirect if cart is empty
  if (state.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">
            Add some items to your cart before checkout
          </p>
          <Link href="/">
            <Button>Start Shopping</Button>
          </Link>
        </div>
      </div>
    );
  }

  const subtotal = state.items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const shipping = subtotal >= 5000 ? 0 : 200;
  const codCharges = paymentMethod === 'cash_on_delivery' ? 100 : 0;
  const tax = 0;
  const total = subtotal + shipping + tax + codCharges;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/cart"
          className="inline-flex items-center text-primary hover:underline mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Cart
        </Link>
        <h1 className="text-3xl font-bold">Checkout</h1>
        <p className="text-gray-600">Complete your order</p>

        {/* Guest Checkout Info */}
        {!user && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-blue-800">
                  <strong>Guest Checkout:</strong> You can place an order without creating
                  an account. We&apos;ll use your email to send order confirmation and
                  updates.
                </p>
                <p className="text-sm text-blue-700 mt-2">
                  Have an account?{' '}
                  <Link
                    href="/auth/signin"
                    className="font-semibold underline hover:text-blue-900"
                  >
                    Sign in
                  </Link>{' '}
                  to track all your orders easily.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Forms */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      {...register('firstName')}
                      className={errors.firstName ? 'border-red-500' : ''}
                    />
                    {errors.firstName && (
                      <p className="text-sm text-red-500 mt-1">
                        {errors.firstName.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      {...register('lastName')}
                      className={errors.lastName ? 'border-red-500' : ''}
                    />
                    {errors.lastName && (
                      <p className="text-sm text-red-500 mt-1">
                        {errors.lastName.message}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    {...register('email')}
                    className={errors.email ? 'border-red-500' : ''}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+92 300 1234567"
                    {...register('phone')}
                    className={errors.phone ? 'border-red-500' : ''}
                  />
                  {errors.phone && (
                    <p className="text-sm text-red-500 mt-1">{errors.phone.message}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Billing Address */}
            <Card>
              <CardHeader>
                <CardTitle>Billing Address</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="address">Street Address *</Label>
                  <Input
                    id="address"
                    {...register('address')}
                    placeholder="House#, Street, Area"
                    className={errors.address ? 'border-red-500' : ''}
                  />
                  {errors.address && (
                    <p className="text-sm text-red-500 mt-1">{errors.address.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      {...register('city')}
                      className={errors.city ? 'border-red-500' : ''}
                    />
                    {errors.city && (
                      <p className="text-sm text-red-500 mt-1">{errors.city.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="state">Province *</Label>
                    <Input
                      id="state"
                      {...register('state')}
                      placeholder="e.g., Punjab, Sindh"
                      className={errors.state ? 'border-red-500' : ''}
                    />
                    {errors.state && (
                      <p className="text-sm text-red-500 mt-1">{errors.state.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="zipCode">Postal Code *</Label>
                    <Input
                      id="zipCode"
                      {...register('zipCode')}
                      className={errors.zipCode ? 'border-red-500' : ''}
                    />
                    {errors.zipCode && (
                      <p className="text-sm text-red-500 mt-1">
                        {errors.zipCode.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="country">Country *</Label>
                    <Input
                      id="country"
                      {...register('country')}
                      className={errors.country ? 'border-red-500' : ''}
                    />
                    {errors.country && (
                      <p className="text-sm text-red-500 mt-1">
                        {errors.country.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Different Delivery Address */}
                <div className="flex items-center space-x-2 pt-4 border-t">
                  <Checkbox
                    id="useDifferentDelivery"
                    checked={useDifferentDelivery}
                    onCheckedChange={(checked) =>
                      setValue('useDifferentDelivery', checked as boolean)
                    }
                  />
                  <Label
                    htmlFor="useDifferentDelivery"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    Deliver to a different address
                  </Label>
                </div>

                {useDifferentDelivery && (
                  <div className="space-y-4 pt-4 border-t">
                    <h3 className="font-semibold">Delivery Address</h3>
                    <div>
                      <Label htmlFor="deliveryAddress">Street Address *</Label>
                      <Input
                        id="deliveryAddress"
                        {...register('deliveryAddress')}
                        placeholder="House#, Street, Area"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="deliveryCity">City *</Label>
                        <Input id="deliveryCity" {...register('deliveryCity')} />
                      </div>
                      <div>
                        <Label htmlFor="deliveryState">Province *</Label>
                        <Input
                          id="deliveryState"
                          {...register('deliveryState')}
                          placeholder="e.g., Punjab, Sindh"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="deliveryZipCode">Postal Code *</Label>
                        <Input id="deliveryZipCode" {...register('deliveryZipCode')} />
                      </div>
                      <div>
                        <Label htmlFor="deliveryCountry">Country *</Label>
                        <Input
                          id="deliveryCountry"
                          {...register('deliveryCountry')}
                          defaultValue="Pakistan"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Method</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <RadioGroup
                  value={paymentMethod}
                  onValueChange={(value: string) =>
                    setValue(
                      'paymentMethod',
                      value as 'bank_transfer' | 'cash_on_delivery'
                    )
                  }
                >
                  {/* Bank Transfer Option */}
                  <div
                    className={`flex items-start space-x-3 border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                      paymentMethod === 'bank_transfer'
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-200'
                    }`}
                    onClick={() => setValue('paymentMethod', 'bank_transfer')}
                  >
                    <RadioGroupItem value="bank_transfer" id="bank_transfer" />
                    <div className="flex-1">
                      <Label
                        htmlFor="bank_transfer"
                        className="flex items-center cursor-pointer"
                      >
                        <Building2 className="h-5 w-5 mr-2" />
                        <span className="font-semibold">Bank Transfer</span>
                      </Label>
                      <p className="text-sm text-gray-600 mt-1">
                        Transfer to our bank account and upload screenshot
                      </p>

                      {paymentMethod === 'bank_transfer' && (
                        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                          <h4 className="font-semibold text-sm mb-2">
                            Bank Account Details:
                          </h4>
                          <div className="text-sm space-y-1">
                            <p>
                              <strong>Bank:</strong> HBL Bank
                            </p>
                            <p>
                              <strong>Account Title:</strong> Eterna Jewels
                            </p>
                            <p>
                              <strong>Account Number:</strong> 1234567890123
                            </p>
                            <p>
                              <strong>IBAN:</strong> PK12HABB1234567890123456
                            </p>
                          </div>

                          <div className="mt-4">
                            <Label htmlFor="paymentScreenshot" className="block mb-2">
                              Upload Payment Screenshot *
                            </Label>
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                              <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                              <Input
                                id="paymentScreenshot"
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="hidden"
                              />
                              <Label
                                htmlFor="paymentScreenshot"
                                className="cursor-pointer text-sm text-primary hover:underline"
                              >
                                Click to upload screenshot
                              </Label>
                              <p className="text-xs text-gray-500 mt-1">
                                PNG, JPG up to 5MB
                              </p>
                              {paymentFile && (
                                <p className="text-sm text-green-600 mt-2">
                                  ✓ {paymentFile.name}
                                </p>
                              )}
                            </div>
                            {errors.paymentScreenshot && (
                              <p className="text-sm text-red-500 mt-1">
                                {errors.paymentScreenshot.message}
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Cash on Delivery Option */}
                  <div
                    className={`flex items-start space-x-3 border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                      paymentMethod === 'cash_on_delivery'
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-200'
                    }`}
                    onClick={() => setValue('paymentMethod', 'cash_on_delivery')}
                  >
                    <RadioGroupItem value="cash_on_delivery" id="cash_on_delivery" />
                    <div className="flex-1">
                      <Label
                        htmlFor="cash_on_delivery"
                        className="flex items-center cursor-pointer"
                      >
                        <Wallet className="h-5 w-5 mr-2" />
                        <span className="font-semibold">Cash on Delivery</span>
                        <Badge variant="secondary" className="ml-2">
                          + Rs 100
                        </Badge>
                      </Label>
                      <p className="text-sm text-gray-600 mt-1">
                        Pay with cash when your order is delivered
                      </p>

                      {paymentMethod === 'cash_on_delivery' && (
                        <div className="mt-4 p-4 bg-yellow-50 rounded-lg flex items-start space-x-2">
                          <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                          <div className="text-sm text-yellow-800">
                            <p className="font-semibold mb-1">Please Note:</p>
                            <ul className="list-disc list-inside space-y-1">
                              <li>Additional Rs 100 COD charges apply</li>
                              <li>Please keep exact cash ready</li>
                              <li>Available for orders within Pakistan only</li>
                            </ul>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Order Items */}
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {state.items.map((item) => (
                    <div key={item.id} className="flex space-x-3">
                      <div className="w-16 h-16 relative flex-shrink-0">
                        <Image
                          src={item.product.images[0]}
                          alt={item.product.name}
                          fill
                          className="object-cover rounded"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {item.product.name}
                        </p>
                        <p className="text-xs text-gray-600">Qty: {item.quantity}</p>
                        <p className="text-sm font-medium text-primary">
                          {formatPrice(item.product.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Price Breakdown */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal ({state.itemCount} items)</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>
                      {shipping === 0 ? (
                        <span className="text-green-600">Free</span>
                      ) : (
                        formatPrice(shipping)
                      )}
                    </span>
                  </div>
                  {codCharges > 0 && (
                    <div className="flex justify-between">
                      <span>COD Charges</span>
                      <span>{formatPrice(codCharges)}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                </div>

                <Separator />

                {/* Shipping Info */}
                <div className="bg-green-50 p-3 rounded-lg">
                  <div className="flex items-center space-x-2 text-sm text-green-700">
                    <Truck className="h-4 w-4" />
                    <span>Free shipping on orders above Rs 5,000</span>
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={isProcessing}
                >
                  {isProcessing ? 'Processing...' : 'Place Order'}
                </Button>

                <p className="text-xs text-gray-500 text-center">
                  By placing your order, you agree to our terms and conditions
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
