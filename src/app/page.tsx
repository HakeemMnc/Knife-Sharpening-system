'use client';

import Image from 'next/image'
import Card from '@/components/ui/Card'
import { useState, useEffect, useRef } from 'react'
import { PaymentForm } from '@/components/PaymentForm'

export default function Home() {
  // Form state management
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [quantities, setQuantities] = useState({
    items: 4,
    scissors: 0,
    garden: 0,
    other: 0
  });
  const [total, setTotal] = useState(0);

  // Validation state
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [hasValidated, setHasValidated] = useState(false);

  // STEP 1: Upsells State Management
  const [showUpsells, setShowUpsells] = useState(false);
  const [selectedBundles, setSelectedBundles] = useState({
    knives: 'standard',
    scissors: 'standard',
    garden: 'standard',
    other: 'standard'
  });
  const [applyToAll, setApplyToAll] = useState<string>('standard');
  const [finalTotal, setFinalTotal] = useState(0);
  const [nextPickupDay, setNextPickupDay] = useState('');
  const [showSharpenPopup, setShowSharpenPopup] = useState(false);

  // Payment state
  const [showPayment, setShowPayment] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<{id: number; total: number; pickupDate: string} | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');

  // Contact form state
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    message: '',
    isSubmitting: false,
    error: '',
    success: ''
  });

  // Calculate next Monday pickup day
  const getNextMonday = () => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const daysUntilMonday = dayOfWeek === 1 ? 7 : (8 - dayOfWeek) % 7;
    const nextMonday = new Date(today);
    nextMonday.setDate(today.getDate() + daysUntilMonday);
    return nextMonday;
  };

  // Set next pickup day on component mount
  useEffect(() => {
    const nextMonday = getNextMonday();
    const formattedDate = nextMonday.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: '2-digit', 
      day: '2-digit' 
    });
    setNextPickupDay(formattedDate);
  }, []);


    // Handle input changes
  const handleFirstNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFirstName(e.target.value);
    if (hasValidated) clearFieldError('firstName');
  };

  const handleLastNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLastName(e.target.value);
    if (hasValidated) clearFieldError('lastName');
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (hasValidated) clearFieldError('email');
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(e.target.value);
    if (hasValidated) clearFieldError('phone');
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAddress(e.target.value);
    if (hasValidated) clearFieldError('address');
  };

  // Clear field error when user starts typing
  const clearFieldError = (fieldName: string) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
  };

  // Comprehensive validation function
  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    // Email validation
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailPattern.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Phone validation
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
    if (!phone || cleanPhone.length !== 10 || !/^\d+$/.test(cleanPhone)) {
      newErrors.phone = 'Please enter a 10-digit phone number';
    }

    // Address validation
    if (!address || address.length < 10) {
      newErrors.address = 'Please enter a complete address';
    } else if (!/\d/.test(address) || !/[a-zA-Z]/.test(address)) {
      newErrors.address = 'Please enter a complete address with street number and name';
    }

    // Name validation
    if (!firstName || firstName.length < 2) {
      newErrors.firstName = 'Please enter your first name';
    }
    if (!lastName || lastName.length < 2) {
      newErrors.lastName = 'Please enter your last name';
    }

    // Item selection validation
    const totalItems = Object.values(quantities).reduce((sum, qty) => sum + qty, 0);
    if (totalItems === 0) {
      newErrors.items = 'Please select at least one item to sharpen';
    }

    setErrors(newErrors);
    setHasValidated(true);

    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      // All validation passed - show upsells step
      setShowUpsells(true);
      
      // Scroll to top of the booking section to show ORDER SUMMARY heading
      setTimeout(() => {
        const bookingSection = document.getElementById('booking');
        if (bookingSection) {
          bookingSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 50);
    } else {
      // Scroll to first error
      const firstErrorField = document.querySelector('[data-error="true"]');
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  // Handle bundle selection
  const handleBundleChange = (category: string, bundle: string) => {
    setSelectedBundles(prev => ({
      ...prev,
      [category]: bundle
    }));
  };

  // Handle apply to all
  const handleApplyToAll = (bundle: string) => {
    setApplyToAll(bundle);
    setSelectedBundles({
      knives: bundle,
      scissors: bundle,
      garden: bundle,
      other: bundle
    });
  };

  // Handle back to order
  const handleBackToOrder = () => {
    setShowUpsells(false);
    
    // Scroll to item selection section after state change
    setTimeout(() => {
      const itemSection = document.getElementById('item-selection');
      if (itemSection) {
        itemSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 50);
  };

  // Handle complete booking
  const handleCompleteBooking = async () => {
    try {
      // Prepare order data
      const orderData = {
        firstName,
        lastName,
        email,
        phone,
        address,
        specialInstructions,
        totalItems: getItemCount(),
        serviceLevel: applyToAll,
        finalTotal
      };

      // Submit order to database
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      const result = await response.json();

      if (result.success) {
        // Store order and show payment form
        setCurrentOrder(result.order);
        setShowPayment(true);
        setPaymentStatus('idle');
      } else {
        alert(`Error: ${result.error || 'Failed to submit booking'}`);
      }
    } catch (error) {
      console.error('Error submitting booking:', error);
      alert('Network error. Please try again.');
    }
  };

  // Handle payment success
  const handlePaymentSuccess = (paymentIntentId: string) => {
    setPaymentStatus('success');
    if (currentOrder) {
      alert(`Payment successful! Order #${currentOrder.id}\n\nPickup Date: ${currentOrder.pickupDate}\nTotal: $${currentOrder.total.toFixed(2)}\n\nYou will receive a confirmation SMS shortly.`);
    }
    
    // Reset form and payment state
    setShowPayment(false);
    setCurrentOrder(null);
    setPaymentStatus('idle');
    
    // Reset form
    setFirstName('');
    setLastName('');
    setEmail('');
    setPhone('');
    setAddress('');
    setSpecialInstructions('');
    setQuantities({ items: 4, scissors: 0, garden: 0, other: 0 });
    setShowUpsells(false);
  };

  // Handle payment error
  const handlePaymentError = (error: string) => {
    setPaymentStatus('error');
    alert(`Payment failed: ${error}`);
  };

  // Handle payment cancellation
  const handlePaymentCancel = () => {
    setShowPayment(false);
    setCurrentOrder(null);
    setPaymentStatus('idle');
  };

  // Handle contact form submission
  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous messages
    setContactForm(prev => ({ ...prev, error: '', success: '' }));
    
    // Set submitting state
    setContactForm(prev => ({ ...prev, isSubmitting: true }));
    
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: contactForm.name,
          email: contactForm.email,
          message: contactForm.message
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Success - clear form and show success message
        setContactForm({
          name: '',
          email: '',
          message: '',
          isSubmitting: false,
          error: '',
          success: result.message || 'Message sent successfully!'
        });
      } else {
        // Error
        setContactForm(prev => ({
          ...prev,
          isSubmitting: false,
          error: result.error || 'Failed to send message. Please try again.'
        }));
      }
    } catch (error) {
      console.error('Error submitting contact form:', error);
      setContactForm(prev => ({
        ...prev,
        isSubmitting: false,
        error: 'Network error. Please check your connection and try again.'
      }));
    }
  };

  // Helper functions for calculations
  const getItemCount = () => Object.values(quantities).reduce((sum, qty) => sum + qty, 0);
  const getSubtotal = () => getItemCount() * 15;
  const getUpsellsCost = () => Object.entries(selectedBundles).reduce((total, [category, bundle]) => {
    const cost = getBundleCost(category);
    return total + (isNaN(cost) ? 0 : cost);
  }, 0);
  const getItemSummary = () => {
    const items = [];
    if (quantities.items > 0) items.push(`Items: ${quantities.items}`);
    if (quantities.scissors > 0) items.push(`Scissors: ${quantities.scissors}`);
    if (quantities.garden > 0) items.push(`Garden Tools: ${quantities.garden}`);
    if (quantities.other > 0) items.push(`Other: ${quantities.other}`);
    return items.join(', ');
  };

  // STEP 1: Simplified Two-Card Bundle Layout
  const serviceBundles = {
    standard: {
      name: 'Standard Care',
      title: 'Standard Care',
      price: 0,
      priceText: 'Included',
      description: 'Razor-sharp edge, ready to perform',
      benefits: [
        'Razor-sharp edge',
        'Professional sharpening',
        'Ready for any task',
        'Quality guaranteed'
      ],
      icon: '🔪',
      color: 'gray'
    },
    premium: {
      name: 'Premium Care',
      title: 'Premium Care',
      price: 5,
      priceText: '+$5 per item',
      description: 'Razor sharp + protective finishing',
      benefits: [
        'Mirror polish finish',
        'Rust prevention coating',
        'Lasts 2x longer',
        'Restaurant quality'
      ],
      icon: '✨',
      color: 'blue',
      badge: 'Popular'
    }
  };

  // Helper functions for bundle calculations
  const getBundleCost = (category: string) => {
    // Map category names to match between selectedBundles and quantities
    const categoryMap: { [key: string]: string } = {
      'knives': 'items',
      'scissors': 'scissors',
      'garden': 'garden',
      'other': 'other'
    };
    
    const bundle = selectedBundles[category as keyof typeof selectedBundles];
    const quantityKey = categoryMap[category] || category;
    const quantity = quantities[quantityKey as keyof typeof quantities] || 0;
    const bundlePrice = serviceBundles[bundle as keyof typeof serviceBundles]?.price || 0;
    return quantity * bundlePrice;
  };

  const getCategoryTotal = (category: string) => {
    // Map category names to match between selectedBundles and quantities
    const categoryMap: { [key: string]: string } = {
      'knives': 'items',
      'scissors': 'scissors',
      'garden': 'garden',
      'other': 'other'
    };
    
    const quantityKey = categoryMap[category] || category;
    const categoryQuantity = quantities[quantityKey as keyof typeof quantities] || 0;
    const baseCost = categoryQuantity * 15;
    const bundleCost = getBundleCost(category);
    return baseCost + bundleCost;
  };

  const getCategoriesWithItems = () => {
    return Object.entries(quantities).filter(([_, qty]) => qty > 0);
  };

  // STEP 1: Smart Delivery Fee Logic
  const getCurrentSubtotal = () => {
    const subtotal = getSubtotal();
    const upsellsCost = getUpsellsCost();
    const total = subtotal + upsellsCost;
    return isNaN(total) ? 0 : total;
  };
  const getDeliveryFee = () => getCurrentSubtotal() >= 80 ? 0 : 25;
  const getRemainingForFreeDelivery = () => Math.max(0, 80 - getCurrentSubtotal());
  const hasFreeDelivery = () => getCurrentSubtotal() >= 80;

  // Handle quantity changes
  const updateQuantity = (category: string, change: number) => {
    setQuantities(prev => {
      const newQuantities = {
        ...prev,
        [category]: Math.max(0, prev[category as keyof typeof prev] + change)
      };
      return newQuantities;
    });
  };

  // Calculate total
  useEffect(() => {
    const itemCount = Object.values(quantities).reduce((sum, qty) => sum + qty, 0);
    setTotal(itemCount * 15);
  }, [quantities]);

  // Calculate final total with upsells and delivery
  useEffect(() => {
    const subtotal = getSubtotal();
    const upsellsCost = getUpsellsCost();
    const deliveryFee = getDeliveryFee();
    
    setFinalTotal(subtotal + upsellsCost + deliveryFee);
  }, [quantities, selectedBundles]);

  // Carousel state management
  const [currentSlide, setCurrentSlide] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  // Testimonials carousel state management
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const testimonialsRef = useRef<HTMLDivElement>(null);

  // Testimonials data
  const testimonials = [
    {
      text: "This was the best service I have ever received. The knives are honestly sharper than the day we bought them.",
      name: "Sarah M.",
      date: "March 2025",
      stars: 5
    },
    {
      text: "I'm so pleased. It made my chopping faster and safer and so much easier. I'm certain this blade is sharper than it was when I first bought the knife.",
      name: "David L.",
      date: "January 2025",
      stars: 5
    },
    {
      text: "Amazing results! My old chef's knife was practically useless, now it glides through tomatoes like butter. Will definitely be using this service again.",
      name: "Jennifer K.",
      date: "April 2025",
      stars: 5
    },
    {
      text: "Quick, professional, and convenient. Left my knives on the porch Monday morning, picked them up Tuesday evening perfectly sharp. Couldn't be happier.",
      name: "Mark R.",
      date: "December 2024",
      stars: 5
    },
    {
      text: "Best $75 I've spent in ages. My entire knife block feels brand new again. The difference is incredible - wish I'd found this service sooner.",
      name: "Lisa T.",
      date: "February 2025",
      stars: 5
    }
  ];

  // Auto-advance testimonials every 6 seconds (paused on hover)
  useEffect(() => {
    if (isHovered) return;
    
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [testimonials.length, isHovered]);

  // Handle testimonials navigation
  const goToTestimonial = (index: number) => {
    setCurrentTestimonial(index);
  };

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  // Touch/swipe support for mobile
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      nextTestimonial();
    }
    if (isRightSwipe) {
      prevTestimonial();
    }

    setTouchStart(null);
    setTouchEnd(null);
  };

  // Handle carousel navigation
  const goToSlide = (slideIndex: number) => {
    setCurrentSlide(slideIndex);
    if (carouselRef.current) {
      const slideWidth = 320; // w-80 = 320px
      carouselRef.current.scrollTo({
        left: slideIndex * slideWidth,
        behavior: 'smooth'
      });
    }
  };

  // Handle scroll events to update current slide
  const handleCarouselScroll = () => {
    if (carouselRef.current) {
      const scrollLeft = carouselRef.current.scrollLeft;
      const slideWidth = 320;
      const newSlide = Math.round(scrollLeft / slideWidth);
      setCurrentSlide(newSlide);
    }
  };



  // Form validation - only check if form has been validated and passed
  const isFormValid = hasValidated && Object.keys(errors).length === 0;
  return (
    <div className="min-h-screen">
      {/* Payment Modal */}
      {showPayment && currentOrder && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md transition-opacity duration-300 ease-in-out flex items-center justify-center z-50 p-4 animate-in fade-in-0">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-white/20">
            <PaymentForm
              orderId={currentOrder.id}
              amount={currentOrder.total}
              onSuccess={handlePaymentSuccess}
              onError={handlePaymentError}
              onCancel={handlePaymentCancel}
            />
          </div>
        </div>
      )}
      {/* SECTION 1 - Hero Header */}
      <section className="pt-4 pb-8 md:pt-6 md:pb-12 lg:pt-8 lg:pb-16" style={{backgroundColor: '#fff8e8', paddingTop: '40px', paddingBottom: '80px'}}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Top Navigation */}
          <div className="flex justify-between items-center mb-8 lg:mb-12 pl-2 md:pl-4 lg:pl-6 pr-2 md:pr-4 lg:pr-6">
            {/* Logo - Left-aligned for better visual balance */}
            <div className="flex-shrink-0 flex justify-start">
              <Image
                src="/logo.png" 
                alt="Northern Rivers Knife Sharpening Logo" 
                width={320} 
                height={192}
                className="w-48 h-28 md:w-60 md:h-36 lg:w-80 lg:h-48 xl:w-96 xl:h-56 object-contain cursor-pointer -ml-4 md:-ml-8 lg:-ml-12 xl:-ml-16"
              />
            </div>
            
            {/* Book Now Button */}
            <div className="flex-shrink-0">
              <a 
                href="#booking"
                className="inline-block px-4 lg:px-6 py-3 text-base lg:text-lg font-medium text-white rounded-lg transition-all duration-200 mr-4 md:mr-6 lg:mr-8"
                style={{
                  backgroundColor: '#d64f24',
                  color: 'white',
                  border: 'none'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#b8431f';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#d64f24';
                }}
                onFocus={(e) => {
                  e.currentTarget.style.outline = '3px solid #4983a6';
                  e.currentTarget.style.outlineOffset = '2px';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.outline = 'none';
                }}
              >
                <span className="lg:hidden">Book Now</span>
                <span className="hidden lg:inline">Book Sharpening Now</span>
              </a>
            </div>
          </div>

          {/* Hero Content - Adjusted layout to match promotional graphic */}
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left Column - Headline and text */}
            <div className="text-center md:text-left order-2 md:order-1 max-w-2xl">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight" style={{
                color: '#013350',
                letterSpacing: '1px',
                textShadow: '2px 2px 4px rgba(0,0,0,0.1)'
              }}>
                Leave Your Knives On<br />
                Your Porch,<br />
                I'll Make Them Sharper<br />
                Than New in 72 Hours
              </h1>
              <p className="text-lg md:text-xl mb-6" style={{color: '#1B1B1B'}}>
                Professional Sharpening Service<br />
                in the Northern Rivers Region
              </p>
              
              {/* Customer Reviews Section */}
              <div className="flex items-center justify-center md:justify-start space-x-2 mb-4">
                <div className="flex space-x-1">
                  {/* Profile pictures */}
                  <div className="w-6 h-6 rounded-full overflow-hidden">
                    <Image
                      src="/person1.png"
                      alt="Customer profile"
                      width={24}
                      height={24}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="w-6 h-6 rounded-full overflow-hidden">
                    <Image
                      src="/person2.png"
                      alt="Customer profile"
                      width={24}
                      height={24}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="w-6 h-6 rounded-full overflow-hidden">
                    <Image
                      src="/person3.png"
                      alt="Customer profile"
                      width={24}
                      height={24}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="w-6 h-6 rounded-full overflow-hidden">
                    <Image
                      src="/person4.png"
                      alt="Customer profile"
                      width={24}
                      height={24}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="w-6 h-6 rounded-full overflow-hidden">
                    <Image
                      src="/person5.png"
                      alt="Customer profile"
                      width={24}
                      height={24}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                <span className="font-bold" style={{color: '#1B1B1B'}}>5.0</span>
                <div className="flex space-x-1">
                  <span className="text-yellow-400">★</span>
                  <span className="text-yellow-400">★</span>
                  <span className="text-yellow-400">★</span>
                  <span className="text-yellow-400">★</span>
                  <span className="text-yellow-400">★</span>
                </div>
              </div>
              <p className="text-sm" style={{color: '#1B1B1B'}}>
                Based on Google Reviews
              </p>
            </div>
            
            {/* Right Column - Vintage Couple Image - Much larger */}
            <div className="flex justify-center order-1 md:order-2 max-w-2xl">
              <Image
                src="/vintage-couple.png" 
                alt="Happy couple cooking with sharp knives" 
                width={600} 
                height={600}
                className="w-full max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl h-auto"
                style={{
                  filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.1))'
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2 - Testimonials */}
      <section className="py-12" style={{
        backgroundColor: '#013350', 
        paddingTop: '45px', 
        paddingBottom: '45px',
        borderTop: '1px solid rgba(255,255,255,0.1)',
        borderBottom: '1px solid rgba(255,255,255,0.1)'
      }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4" style={{
              color: '#ffffff',
              fontSize: 'clamp(2rem, 5vw, 2.5rem)',
              fontWeight: 700,
              letterSpacing: '1px',
              textShadow: '2px 2px 4px rgba(0,0,0,0.1)'
            }}>
              What My Customers Are Saying
            </h2>
          </div>

          {/* Testimonials Carousel */}
          <div 
            className="relative max-w-7xl mx-auto"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {/* Desktop 3-Card Layout */}
            <div className="hidden md:block">
              <div className="flex items-center justify-center space-x-6 px-8">
                {/* Previous Card (Left) */}
                <div 
                  className="flex-shrink-0 cursor-pointer transition-all duration-400 ease-in-out"
                  style={{
                    opacity: 0.4,
                    transform: 'scale(0.85)',
                    width: '300px',
                    height: '280px'
                  }}
                  onClick={() => prevTestimonial()}
                >
                  <div className="bg-white rounded-2xl p-4 shadow-md h-full flex flex-col justify-between transition-all duration-400" style={{
                    boxShadow: '0 8px 24px rgba(1,51,80,0.15)',
                    minHeight: '280px',
                    maxHeight: '280px'
                  }}>
                    {/* Star Rating */}
                    <div className="flex justify-center mb-2">
                      <div className="flex space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className="text-lg" style={{color: '#d64f24'}}>★</span>
                        ))}
                      </div>
                    </div>

                    {/* Testimonial Text */}
                    <div className="flex-1 flex items-center justify-center">
                      <blockquote className="text-sm leading-relaxed text-center transition-opacity duration-300" style={{
                        lineHeight: '1.4',
                        color: '#1B1B1B',
                        display: '-webkit-box',
                        WebkitLineClamp: 4,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}>
                        "{testimonials[(currentTestimonial - 1 + testimonials.length) % testimonials.length].text}"
                      </blockquote>
                    </div>

                    {/* Customer Info */}
                    <div className="text-center mt-2">
                      <div className="font-semibold text-base" style={{color: '#013350'}}>
                        {testimonials[(currentTestimonial - 1 + testimonials.length) % testimonials.length].name}
                      </div>
                      <div className="text-xs mt-1" style={{color: '#013350'}}>
                        {testimonials[(currentTestimonial - 1 + testimonials.length) % testimonials.length].date}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Center Card (Active) */}
                <div 
                  className="flex-shrink-0 transition-all duration-400 ease-in-out"
                  style={{
                    opacity: 1,
                    transform: 'scale(1)',
                    width: '380px',
                    height: '320px'
                  }}
                >
                  <div className="bg-white rounded-2xl p-5 shadow-xl h-full flex flex-col justify-between transition-all duration-400" style={{
                    boxShadow: '0 8px 24px rgba(1,51,80,0.15)',
                    minHeight: '320px',
                    maxHeight: '320px'
                  }}>
                    {/* Star Rating */}
                    <div className="flex justify-center mb-3">
                      <div className="flex space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className="text-2xl" style={{color: '#d64f24'}}>★</span>
                        ))}
                      </div>
                    </div>

                    {/* Testimonial Text */}
                    <div className="flex-1 flex items-center justify-center">
                      <blockquote className="text-lg leading-relaxed text-center transition-opacity duration-300" style={{
                        lineHeight: '1.5',
                        color: '#1B1B1B',
                        display: '-webkit-box',
                        WebkitLineClamp: 6,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}>
                        "{testimonials[currentTestimonial].text}"
                      </blockquote>
                    </div>

                    {/* Customer Info */}
                    <div className="text-center mt-3">
                      <div className="font-semibold text-lg" style={{color: '#013350'}}>
                        {testimonials[currentTestimonial].name}
                      </div>
                      <div className="text-sm mt-1" style={{color: '#013350'}}>
                        {testimonials[currentTestimonial].date}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Next Card (Right) */}
                <div 
                  className="flex-shrink-0 cursor-pointer transition-all duration-400 ease-in-out"
                  style={{
                    opacity: 0.4,
                    transform: 'scale(0.85)',
                    width: '300px',
                    height: '280px'
                  }}
                  onClick={() => nextTestimonial()}
                >
                  <div className="bg-white rounded-2xl p-4 shadow-md h-full flex flex-col justify-between transition-all duration-400" style={{
                    boxShadow: '0 8px 24px rgba(1,51,80,0.15)',
                    minHeight: '280px',
                    maxHeight: '280px'
                  }}>
                    {/* Star Rating */}
                    <div className="flex justify-center mb-2">
                      <div className="flex space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className="text-lg" style={{color: '#d64f24'}}>★</span>
                        ))}
                      </div>
                    </div>

                    {/* Testimonial Text */}
                    <div className="flex-1 flex items-center justify-center">
                      <blockquote className="text-sm leading-relaxed text-center transition-opacity duration-300" style={{
                        lineHeight: '1.4',
                        color: '#1B1B1B',
                        display: '-webkit-box',
                        WebkitLineClamp: 4,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}>
                        "{testimonials[(currentTestimonial + 1) % testimonials.length].text}"
                      </blockquote>
                    </div>

                    {/* Customer Info */}
                    <div className="text-center mt-2">
                      <div className="font-semibold text-base" style={{color: '#013350'}}>
                        {testimonials[(currentTestimonial + 1) % testimonials.length].name}
                      </div>
                      <div className="text-xs mt-1" style={{color: '#013350'}}>
                        {testimonials[(currentTestimonial + 1) % testimonials.length].date}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Navigation Dots */}
              <div className="flex justify-center mt-6 space-x-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToTestimonial(index)}
                    className={`w-2.5 h-2.5 rounded-full transition-all duration-300 hover:scale-110 ${
                      currentTestimonial === index
                        ? 'scale-125 shadow-sm'
                        : 'bg-gray-300 hover:bg-gray-400'
                    }`}
                    style={{
                      backgroundColor: currentTestimonial === index ? '#d64f24' : undefined
                    }}
                    aria-label={`Go to testimonial ${index + 1}`}
                  />
                ))}
              </div>
            </div>

            {/* Mobile Single Card Layout */}
            <div className="md:hidden">
              <div 
                className="bg-white rounded-2xl p-5 shadow-lg relative overflow-hidden transition-all duration-400 mx-4" 
              style={{
                boxShadow: '0 8px 24px rgba(1,51,80,0.15)',
                  minHeight: '240px',
                  maxHeight: '300px'
              }}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {/* Star Rating */}
                <div className="flex justify-center mb-4">
                <div className="flex space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-2xl" style={{color: '#d64f24'}}>★</span>
                  ))}
                </div>
              </div>

              {/* Testimonial Text */}
                <div className="text-center mb-6">
                  <blockquote className="text-lg leading-relaxed transition-opacity duration-300" style={{
                  fontSize: '1.1rem',
                  lineHeight: '1.6',
                  color: '#1B1B1B'
                }}>
                  "{testimonials[currentTestimonial].text}"
                </blockquote>
              </div>

              {/* Customer Info */}
              <div className="text-center">
                <div className="font-semibold text-lg" style={{color: '#013350'}}>
                  {testimonials[currentTestimonial].name}
                </div>
                  <div className="text-sm mt-1" style={{color: '#013350'}}>
                  {testimonials[currentTestimonial].date}
                </div>
                </div>
              </div>

            {/* Mobile Navigation Arrows - Positioned Below Card */}
            <div className="md:hidden flex justify-center items-center mt-6 space-x-4">
              <button
                onClick={prevTestimonial}
                className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center transition-all duration-200 hover:shadow-xl hover:scale-110"
                style={{
                  border: '1px solid #e5e7eb',
                  color: '#d64f24'
                }}
                aria-label="Previous testimonial"
                onFocus={(e) => {
                  e.currentTarget.style.outline = '3px solid #4983a6';
                  e.currentTarget.style.outlineOffset = '2px';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.outline = 'none';
                }}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <button
                onClick={nextTestimonial}
                className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center transition-all duration-200 hover:shadow-xl hover:scale-110"
                style={{
                  border: '1px solid #e5e7eb',
                  color: '#d64f24'
                }}
                aria-label="Next testimonial"
                onFocus={(e) => {
                  e.currentTarget.style.outline = '3px solid #4983a6';
                  e.currentTarget.style.outlineOffset = '2px';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.outline = 'none';
                }}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Navigation Dots */}
              <div className="flex justify-center mt-6 space-x-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToTestimonial(index)}
                    className={`w-2.5 h-2.5 rounded-full transition-all duration-300 hover:scale-110 ${
                    currentTestimonial === index
                        ? 'scale-125 shadow-sm'
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                  style={{
                    backgroundColor: currentTestimonial === index ? '#d64f24' : undefined
                  }}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3 - How We Work */}
      <section className="py-16 md:py-20 lg:py-24 relative overflow-hidden" style={{
        backgroundColor: '#fff8e8',
        paddingTop: '80px',
        paddingBottom: '80px',
        borderTop: '3px solid #4983a6'
      }}>
        
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h1 className="text-xl md:text-5xl lg:text-6xl font-bold mb-5" style={{
              fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
              fontWeight: 700,
              color: '#013350',
              letterSpacing: '1px',
              textShadow: '2px 2px 4px rgba(0,0,0,0.1)'
            }}>
              How It Works
            </h1>
            <h2 className="text-xl md:text-2xl font-medium" style={{
              fontSize: '1.2rem',
              fontWeight: 500,
              color: '#6b7280',
              letterSpacing: '0.01em'
            }}>
              Professional Knife Sharpening Made Simple
            </h2>
          </div>
          
          {/* Desktop Layout - Enhanced Horizontal Grid */}
          <div className="hidden md:block relative">
            {/* Connecting Line */}
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-60" style={{
              transform: 'translateY(-50%)',
              zIndex: 1,
              background: 'linear-gradient(to right, transparent, #4983a6, transparent)'
            }}></div>
            
            <div className="grid md:grid-cols-4 gap-8 relative z-10">
              {/* Step 1 */}
              <div className="bg-white rounded-2xl p-6 text-center h-full border border-gray-200 transition-all duration-300 hover:shadow-xl hover:-translate-y-1" style={{
                boxShadow: '0 8px 32px rgba(1,51,80,0.15)',
                background: '#ffffff',
                minHeight: '220px',
                position: 'relative'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(1,51,80,0.15)';
                e.currentTarget.style.borderColor = '#d64f24';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(1,51,80,0.1)';
                e.currentTarget.style.borderColor = '#e2e8f0';
              }}>

                <div className="mb-4">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{
                    backgroundColor: '#013350'
                  }}>
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-lg font-bold mb-3" style={{
                  color: '#013350', 
                  fontWeight: 600, 
                  letterSpacing: '0.01em'
                }}>
                   1. Quick Booking
                  </h3>
                <p className="text-sm" style={{
                  color: '#4a5568', 
                  letterSpacing: '0.005em', 
                  lineHeight: '1.6'
                }}>
                  Fill out our simple form with your details and item count
                </p>
              </div>

              {/* Step 2 */}
              <div className="bg-white rounded-2xl p-6 text-center h-full border border-gray-200 transition-all duration-300 hover:shadow-xl hover:-translate-y-1" style={{
                boxShadow: '0 8px 32px rgba(1,51,80,0.15)',
                background: '#ffffff',
                minHeight: '220px',
                position: 'relative'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(1,51,80,0.15)';
                e.currentTarget.style.borderColor = '#d64f24';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(1,51,80,0.1)';
                e.currentTarget.style.borderColor = '#e2e8f0';
              }}>

                <div className="mb-4">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{
                    backgroundColor: '#013350'
                  }}>
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-lg font-bold mb-3" style={{
                  color: '#013350', 
                  fontWeight: 600, 
                  letterSpacing: '0.01em'
                }}>
                   2. Secure Payment
                  </h3>
                <p className="text-sm" style={{
                  color: '#4a5568', 
                  letterSpacing: '0.005em', 
                  lineHeight: '1.6'
                }}>
                  Pay securely online with instant confirmation
                </p>
              </div>

              {/* Step 3 */}
              <div className="bg-white rounded-2xl p-6 text-center h-full border border-gray-200 transition-all duration-300 hover:shadow-xl hover:-translate-y-1" style={{
                boxShadow: '0 8px 32px rgba(1,51,80,0.15)',
                background: '#ffffff',
                minHeight: '220px',
                position: 'relative'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(1,51,80,0.15)';
                e.currentTarget.style.borderColor = '#d64f24';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(1,51,80,0.1)';
                e.currentTarget.style.borderColor = '#e2e8f0';
              }}>

                <div className="mb-4">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{
                    backgroundColor: '#013350'
                  }}>
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-lg font-bold mb-3" style={{
                  color: '#013350', 
                  fontWeight: 600, 
                  letterSpacing: '0.01em'
                }}>
                   3. Easy Pickup
                  </h3>
                <p className="text-sm" style={{
                  color: '#4a5568', 
                  letterSpacing: '0.005em', 
                  lineHeight: '1.6'
                }}>
                  Leave knives on your porch for convenient pickup
                </p>
              </div>

              {/* Step 4 */}
              <div className="bg-white rounded-2xl p-6 text-center h-full border border-gray-200 transition-all duration-300 hover:shadow-xl hover:-translate-y-1" style={{
                boxShadow: '0 8px 32px rgba(1,51,80,0.15)',
                background: '#ffffff',
                minHeight: '220px',
                position: 'relative'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(1,51,80,0.15)';
                e.currentTarget.style.borderColor = '#d64f24';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(1,51,80,0.1)';
                e.currentTarget.style.borderColor = '#e2e8f0';
              }}>

                <div className="mb-4">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{
                    backgroundColor: '#013350'
                  }}>
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-lg font-bold mb-3" style={{
                  color: '#013350', 
                  fontWeight: 600, 
                  letterSpacing: '0.01em'
                }}>
                  4. Perfect Results
                </h3>
                <p className="text-sm" style={{
                  color: '#4a5568', 
                  letterSpacing: '0.005em', 
                  lineHeight: '1.6'
                }}>
                  Enjoy razor-sharp knives delivered back in 72 hours
                </p>
              </div>
            </div>
          </div>

                    {/* Mobile Layout - Enhanced Horizontal Scroll Carousel */}
          <div className="md:hidden">
            <div 
              ref={carouselRef}
              onScroll={handleCarouselScroll}
              className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-4 px-4"
              style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none'
              }}
            >
              {/* Step 1 */}
              <div className="flex-shrink-0 w-80 snap-start pr-4">
                <div className="bg-white rounded-2xl p-6 md:p-4 text-center h-full border-2 md:border md:border-gray-200 transition-all duration-300" style={{
                  background: '#ffffff',
                  minHeight: '260px',
                  position: 'relative',
                  borderColor: '#013350'
                }}>

                  <div className="mb-4">
                    <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4" style={{
                      backgroundColor: '#013350'
                    }}>
                      <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                  </div>
                  <h3 className="text-lg font-bold md:font-semibold mb-3" style={{
                    color: '#013350', 
                    fontWeight: 600, 
                    letterSpacing: '0.01em'
                  }}>
                    1. Quick Booking
                  </h3>
                  <p className="text-sm font-semibold md:font-normal" style={{
                    color: '#1B1B1B', 
                    letterSpacing: '0.005em', 
                    lineHeight: '1.6'
                  }}>
                    Fill out our simple form with your details and knife count
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex-shrink-0 w-80 snap-start pr-4">
                <div className="bg-white rounded-2xl p-6 md:p-4 text-center h-full border-2 md:border md:border-gray-200 transition-all duration-300" style={{
                  background: '#ffffff',
                  minHeight: '260px',
                  position: 'relative',
                  borderColor: '#013350'
                }}>

                  <div className="mb-4">
                    <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4" style={{
                      backgroundColor: '#013350'
                    }}>
                      <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                  </div>
                  <h3 className="text-lg font-bold md:font-semibold mb-3" style={{
                    color: '#013350', 
                    fontWeight: 600, 
                    letterSpacing: '0.01em'
                  }}>
                    2. Secure Payment
                  </h3>
                  <p className="text-sm font-semibold md:font-normal" style={{
                    color: '#1B1B1B', 
                    letterSpacing: '0.005em', 
                    lineHeight: '1.6'
                  }}>
                    Pay securely online with instant confirmation
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex-shrink-0 w-80 snap-start pr-4">
                <div className="bg-white rounded-2xl p-6 md:p-4 text-center h-full border-2 md:border md:border-gray-200 transition-all duration-300" style={{
                  background: '#ffffff',
                  minHeight: '260px',
                  position: 'relative',
                  borderColor: '#013350'
                }}>

                  <div className="mb-4">
                    <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4" style={{
                      backgroundColor: '#013350'
                    }}>
                      <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                    </div>
                  </div>
                  <h3 className="text-lg font-bold md:font-semibold mb-3" style={{
                    color: '#013350', 
                    fontWeight: 600, 
                    letterSpacing: '0.01em'
                  }}>
                    3. Easy Pickup
                  </h3>
                  <p className="text-sm font-semibold md:font-normal" style={{
                    color: '#1B1B1B', 
                    letterSpacing: '0.005em', 
                    lineHeight: '1.6'
                  }}>
                    Leave knives on your porch for convenient pickup
                  </p>
                </div>
              </div>

              {/* Step 4 */}
              <div className="flex-shrink-0 w-80 snap-start pr-4">
                <div className="bg-white rounded-2xl p-6 md:p-4 text-center h-full border-2 md:border md:border-gray-200 transition-all duration-300" style={{
                  background: '#ffffff',
                  minHeight: '260px',
                  position: 'relative',
                  borderColor: '#013350'
                }}>

                  <div className="mb-4">
                    <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4" style={{
                      backgroundColor: '#013350'
                    }}>
                      <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                      </svg>
                    </div>
                  </div>
                  <h3 className="text-lg font-bold md:font-semibold mb-3" style={{
                    color: '#013350', 
                    fontWeight: 600, 
                    letterSpacing: '0.01em'
                  }}>
                    4. Perfect Results
                  </h3>
                  <p className="text-sm font-semibold md:font-normal" style={{
                    color: '#1B1B1B', 
                    letterSpacing: '0.005em', 
                    lineHeight: '1.6'
                  }}>
                    Enjoy razor-sharp knives delivered back in 72 hours
                  </p>
                </div>
              </div>
            </div>
            
            {/* Mobile Scroll Indicator - Optimized */}
            <div className="flex justify-center mt-8 space-x-3 px-4">
              {[0, 1, 2, 3].map((index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`relative w-1 h-1 rounded-full transition-all duration-200 ease-in-out cursor-pointer focus:outline-none focus:ring-1 focus:ring-white focus:ring-opacity-50 ${
                    currentSlide === index
                      ? 'scale-125 shadow-sm'
                      : 'hover:scale-110'
                  }`}
                  style={{
                    backgroundColor: currentSlide === index ? '#d64f24' : '#013350',
                    minWidth: '12px',
                    minHeight: '12px',
                    opacity: currentSlide === index ? '1' : '0.4'
                  }}
                  aria-label={`Go to slide ${index + 1}`}
                >
                  {/* Touch target enhancement */}
                  <div className="absolute inset-0 -m-1 rounded-full"></div>
                </button>
              ))}
            </div>

            {/* Mobile CTA Button - Positioned After All Steps */}
            <div className="text-center mt-8 px-4">
              <a 
                href="#booking"
                className="inline-block px-8 py-4 text-lg font-semibold text-white rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                style={{
                  backgroundColor: '#d64f24',
                  boxShadow: '0 4px 12px rgba(214, 79, 36, 0.3)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#b8431f';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(214, 79, 36, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#d64f24';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(214, 79, 36, 0.3)';
                }}
                onFocus={(e) => {
                  e.currentTarget.style.outline = '3px solid #4983a6';
                  e.currentTarget.style.outlineOffset = '2px';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.outline = 'none';
                }}
              >
                Book Knife Sharpening Now
              </a>
            </div>
          </div>

          {/* Desktop CTA Button */}
          <div className="hidden md:block text-center mt-16">
            <a 
              href="#booking"
              className="inline-block px-8 py-4 text-lg font-semibold text-white rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              style={{
                backgroundColor: '#d64f24',
                boxShadow: '0 4px 12px rgba(214, 79, 36, 0.3)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#b8431f';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(214, 79, 36, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#d64f24';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(214, 79, 36, 0.3)';
              }}
              onFocus={(e) => {
                e.currentTarget.style.outline = '3px solid #4983a6';
                e.currentTarget.style.outlineOffset = '2px';
              }}
              onBlur={(e) => {
                e.currentTarget.style.outline = 'none';
              }}
            >
              Book Knife Sharpening Now
            </a>
          </div>
        </div>
      </section>

      {/* SECTION 4 - Before/After Results */}
      <section className="py-16 md:py-20 lg:py-24" style={{
        backgroundColor: '#013350',
        paddingTop: '80px',
        paddingBottom: '80px',
        borderTop: '1px solid rgba(255,255,255,0.1)',
        borderBottom: '1px solid rgba(255,255,255,0.1)'
      }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6" style={{
              color: '#ffffff',
              fontSize: 'clamp(2rem, 5vw, 2.5rem)',
              fontWeight: 700,
              letterSpacing: '1px',
              textShadow: '2px 2px 4px rgba(0,0,0,0.1)'
            }}>
              Professional Results Guaranteed
            </h2>
          </div>

          {/* Before/After Image Row */}
          <div className="flex flex-col items-center" style={{marginTop: '40px', marginBottom: '32px'}}>
            {/* Desktop: Horizontal Row */}
            <div className="hidden md:flex items-center justify-center space-x-4 lg:space-x-6">
              {/* Image 1 */}
              <div className="bg-white rounded-xl overflow-hidden" style={{
                width: '280px',
                height: '210px',
                borderRadius: '12px',
                boxShadow: '0 8px 24px rgba(1,51,80,0.2)',
                border: '1px solid #e2e8f0'
              }}>
                <Image
                  src="/BA1.png"
                  alt="Chef's Knife Before and After Sharpening"
                  width={280}
                  height={210}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Image 2 */}
              <div className="bg-white rounded-xl overflow-hidden" style={{
                width: '280px',
                height: '210px',
                borderRadius: '12px',
                boxShadow: '0 8px 24px rgba(1,51,80,0.2)',
                border: '1px solid #e2e8f0'
              }}>
                <Image
                  src="/BA2.png"
                  alt="Kitchen Scissors Before and After Sharpening"
                  width={280}
                  height={210}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Image 3 */}
              <div className="bg-white rounded-xl overflow-hidden" style={{
                width: '280px',
                height: '210px',
                borderRadius: '12px',
                boxShadow: '0 8px 24px rgba(1,51,80,0.2)',
                border: '1px solid #e2e8f0'
              }}>
                <Image
                  src="/BA3.png"
                  alt="Garden Shears Before and After Sharpening"
                  width={280}
                  height={210}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Image 4 */}
              <div className="bg-white rounded-xl overflow-hidden" style={{
                width: '280px',
                height: '210px',
                borderRadius: '12px',
                boxShadow: '0 8px 24px rgba(1,51,80,0.2)',
                border: '1px solid #e2e8f0'
              }}>
                <Image
                  src="/BA4.png"
                  alt="Professional Knife Sharpening Results"
                  width={280}
                  height={210}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Tablet: 2x2 Grid */}
            <div className="hidden sm:block md:hidden">
              <div className="grid grid-cols-2 gap-6">
                {/* Image 1 */}
                <div className="bg-white rounded-xl overflow-hidden" style={{
                  width: '200px',
                  height: '150px',
                  borderRadius: '12px',
                  boxShadow: '0 8px 24px rgba(1,51,80,0.2)',
                  border: '1px solid #e2e8f0'
                }}>
                  <Image
                    src="/BA1.png"
                    alt="Chef's Knife Before and After Sharpening"
                    width={200}
                    height={150}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Image 2 */}
                <div className="bg-white rounded-xl overflow-hidden" style={{
                  width: '200px',
                  height: '150px',
                  borderRadius: '12px',
                  boxShadow: '0 8px 24px rgba(1,51,80,0.2)',
                  border: '1px solid #e2e8f0'
                }}>
                  <Image
                    src="/BA2.png"
                    alt="Kitchen Scissors Before and After Sharpening"
                    width={200}
                    height={150}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Image 3 */}
                <div className="bg-white rounded-xl overflow-hidden" style={{
                  width: '200px',
                  height: '150px',
                  borderRadius: '12px',
                  boxShadow: '0 8px 24px rgba(1,51,80,0.2)',
                  border: '1px solid #e2e8f0'
                }}>
                  <Image
                    src="/BA3.png"
                    alt="Garden Shears Before and After Sharpening"
                    width={200}
                    height={150}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Image 4 */}
                <div className="bg-white rounded-xl overflow-hidden" style={{
                  width: '200px',
                  height: '150px',
                  borderRadius: '12px',
                  boxShadow: '0 8px 24px rgba(1,51,80,0.2)',
                  border: '1px solid #e2e8f0'
                }}>
                  <Image
                    src="/BA4.png"
                    alt="Professional Knife Sharpening Results"
                    width={200}
                    height={150}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>

            {/* Mobile: Vertical Stack */}
            <div className="sm:hidden">
              <div className="flex flex-col items-center space-y-6">
                {/* Image 1 */}
                <div className="bg-white rounded-xl overflow-hidden" style={{
                  width: '280px',
                  height: '210px',
                  borderRadius: '12px',
                  boxShadow: '0 8px 24px rgba(1,51,80,0.2)',
                  border: '1px solid #e2e8f0'
                }}>
                  <Image
                    src="/BA1.png"
                    alt="Chef's Knife Before and After Sharpening"
                    width={280}
                    height={210}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Image 2 */}
                <div className="bg-white rounded-xl overflow-hidden" style={{
                  width: '280px',
                  height: '210px',
                  borderRadius: '12px',
                  boxShadow: '0 8px 24px rgba(1,51,80,0.2)',
                  border: '1px solid #e2e8f0'
                }}>
                  <Image
                    src="/BA2.png"
                    alt="Kitchen Scissors Before and After Sharpening"
                    width={280}
                    height={210}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Image 3 */}
                <div className="bg-white rounded-xl overflow-hidden" style={{
                  width: '280px',
                  height: '210px',
                  borderRadius: '12px',
                  boxShadow: '0 8px 24px rgba(1,51,80,0.2)',
                  border: '1px solid #e2e8f0'
                }}>
                  <Image
                    src="/BA3.png"
                    alt="Garden Shears Before and After Sharpening"
                    width={280}
                    height={210}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Image 4 */}
                <div className="bg-white rounded-xl overflow-hidden" style={{
                  width: '280px',
                  height: '210px',
                  borderRadius: '12px',
                  boxShadow: '0 8px 24px rgba(1,51,80,0.2)',
                  border: '1px solid #e2e8f0'
                }}>
                  <Image
                    src="/BA4.png"
                    alt="Professional Knife Sharpening Results"
                    width={280}
                    height={210}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5 - Main Booking Form */}
      <section id="booking" className="py-16 md:py-20 lg:py-24" style={{backgroundColor: '#fff8e8', paddingTop: '80px', paddingBottom: '80px'}}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                          <div className="text-center mb-16" style={{marginBottom: '40px'}}>
                            <h2 className="text-3xl md:text-4xl font-bold text-center" style={{
                              color: '#013350',
                              fontSize: 'clamp(2rem, 5vw, 2.5rem)',
                  fontWeight: 700,
                              letterSpacing: '1px',
                              textShadow: '2px 2px 4px rgba(0,0,0,0.1)',
                              marginBottom: '16px'
                }}>
                              {showUpsells ? 'ORDER SUMMARY' : 'BOOK KNIFE SHARPENING'}
                </h2>
                            
                            {/* Vintage Decorative Underline */}
                            <div className="flex items-center justify-center mb-4">
                              <div className="w-8 h-0.5 bg-orange-400" style={{
                                backgroundColor: '#d64f24',
                                width: '32px',
                                height: '2px'
                              }}></div>
                              <div className="flex-1 h-1 mx-2" style={{
                                backgroundColor: '#d64f24',
                                height: '4px',
                                borderRadius: '2px'
                              }}></div>
                              <div className="w-8 h-0.5 bg-orange-400" style={{
                                backgroundColor: '#d64f24',
                                width: '32px',
                                height: '2px'
                              }}></div>
                            </div>
                            

                          </div>
          
          {!showUpsells ? (
            <Card className="p-4 md:p-8 bg-white rounded-3xl shadow-lg">
              <div style={{
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                borderRadius: '8px',
                padding: '20px',
                maxWidth: '100%'
              }}
              className="md:p-8">
                <form onSubmit={handleSubmit} className="space-y-6" style={{marginTop: '24px', gap: '24px'}}>
                              {/* Personal Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5" style={{gap: '20px'}}>
                  <div>
                  <label className="block text-sm font-medium mb-2" style={{
                    color: '#1B1B1B',
                    fontWeight: 500,
                    marginBottom: '6px'
                  }}>
                    First Name <span style={{color: '#d64f24'}}>*</span>
                  </label>
                  <input 
                    type="text" 
                    required 
                    value={firstName}
                    onChange={handleFirstNameChange}
                    data-error={!!errors.firstName}
                    className="w-full focus:outline-none"
                    style={{
                      border: errors.firstName ? '1px solid #ef4444' : '1px solid #e2e8f0',
                      borderRadius: '6px',
                      padding: '12px',
                      fontSize: '1rem',
                      backgroundColor: '#ffffff',
                      transition: 'all 0.2s ease'
                    }}
                    onFocus={(e) => {
                      if (!errors.firstName) {
                        e.target.style.borderColor = '#4983a6';
                        e.target.style.boxShadow = '0 0 0 3px rgba(73, 131, 166, 0.1)';
                      }
                    }}
                    onBlur={(e) => {
                      if (!errors.firstName) {
                        e.target.style.borderColor = '#e2e8f0';
                        e.target.style.boxShadow = 'none';
                      }
                    }}
                  />
                  {errors.firstName && (
                    <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{
                    color: '#1B1B1B',
                    fontWeight: 500,
                    marginBottom: '6px'
                  }}>
                    Last Name <span style={{color: '#d64f24'}}>*</span>
                  </label>
                  <input 
                    type="text" 
                    required 
                    value={lastName}
                    onChange={handleLastNameChange}
                    data-error={!!errors.lastName}
                    className="w-full focus:outline-none"
                    style={{
                      border: errors.lastName ? '1px solid #ef4444' : '1px solid #e2e8f0',
                      borderRadius: '6px',
                      padding: '12px',
                      fontSize: '1rem',
                      backgroundColor: '#ffffff',
                      transition: 'all 0.2s ease'
                    }}
                    onFocus={(e) => {
                      if (!errors.lastName) {
                        e.target.style.borderColor = '#4983a6';
                        e.target.style.boxShadow = '0 0 0 3px rgba(73, 131, 166, 0.1)';
                      }
                    }}
                    onBlur={(e) => {
                      if (!errors.lastName) {
                        e.target.style.borderColor = '#e2e8f0';
                        e.target.style.boxShadow = 'none';
                      }
                    }}
                  />
                  {errors.lastName && (
                    <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5" style={{gap: '20px'}}>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{
                    color: '#1B1B1B',
                    fontWeight: 500,
                    marginBottom: '6px'
                  }}>
                    Email Address <span style={{color: '#d64f24'}}>*</span>
                  </label>
                  <input 
                    type="email" 
                    required 
                    value={email}
                    onChange={handleEmailChange}
                    data-error={!!errors.email}
                    className="w-full focus:outline-none"
                    style={{
                      border: errors.email ? '1px solid #ef4444' : '1px solid #e2e8f0',
                      borderRadius: '6px',
                      padding: '12px',
                      fontSize: '1rem',
                      backgroundColor: '#ffffff',
                      transition: 'all 0.2s ease'
                    }}
                    onFocus={(e) => {
                      if (!errors.email) {
                        e.target.style.borderColor = '#4983a6';
                        e.target.style.boxShadow = '0 0 0 3px rgba(73, 131, 166, 0.1)';
                      }
                    }}
                    onBlur={(e) => {
                      if (!errors.email) {
                        e.target.style.borderColor = '#e2e8f0';
                        e.target.style.boxShadow = 'none';
                      }
                    }}
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{
                    color: '#1B1B1B',
                    fontWeight: 500,
                    marginBottom: '6px'
                  }}>
                    Phone Number <span style={{color: '#d64f24'}}>*</span>
                  </label>
                  <input 
                    type="tel" 
                    required 
                    value={phone}
                    onChange={handlePhoneChange}
                    data-error={!!errors.phone}
                    className="w-full focus:outline-none"
                    style={{
                      border: errors.phone ? '1px solid #ef4444' : '1px solid #e2e8f0',
                      borderRadius: '6px',
                      padding: '12px',
                      fontSize: '1rem',
                      backgroundColor: '#ffffff',
                      transition: 'all 0.2s ease'
                    }}
                    onFocus={(e) => {
                      if (!errors.phone) {
                        e.target.style.borderColor = '#4983a6';
                        e.target.style.boxShadow = '0 0 0 3px rgba(73, 131, 166, 0.1)';
                      }
                    }}
                    onBlur={(e) => {
                      if (!errors.phone) {
                        e.target.style.borderColor = '#e2e8f0';
                        e.target.style.boxShadow = 'none';
                      }
                    }}
                  />
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{
                  color: '#1B1B1B',
                  fontWeight: 500,
                  marginBottom: '6px'
                }}>
                  Address to Pick Up <span style={{color: '#d64f24'}}>*</span>
                </label>
                <input 
                  type="text" 
                  required 
                  value={address}
                  onChange={handleAddressChange}
                  data-error={!!errors.address}
                  placeholder="123 Main Street, Byron Bay NSW 2481"
                  className="w-full focus:outline-none"
                  style={{
                    border: errors.address ? '1px solid #ef4444' : '1px solid #e2e8f0',
                    borderRadius: '6px',
                    padding: '12px',
                    fontSize: '1rem',
                    backgroundColor: '#ffffff',
                    transition: 'all 0.2s ease'
                  }}
                  onFocus={(e) => {
                    if (!errors.address) {
                      e.target.style.borderColor = '#4983a6';
                      e.target.style.boxShadow = '0 0 0 3px rgba(73, 131, 166, 0.1)';
                    }
                  }}
                  onBlur={(e) => {
                    if (!errors.address) {
                      e.target.style.borderColor = '#e2e8f0';
                      e.target.style.boxShadow = 'none';
                    }
                  }}
                />
                {errors.address && (
                  <p className="mt-1 text-sm text-red-600">{errors.address}</p>
                )}
                <div className="mt-6 mb-6" style={{marginTop: '24px', marginBottom: '24px'}}>
                  <div style={{
                    backgroundColor: '#f0f9ff',
                    border: '1px solid #bae6fd',
                    borderRadius: '6px',
                    padding: '16px'
                  }}>
                    <div className="flex items-center mb-2">
                      <span className="mr-2">📍</span>
                      <span className="font-bold text-sm" style={{color: '#1B1B1B'}}>
                        Postcodes we serve:
                      </span>
                    </div>
                    <div className="text-sm font-medium" style={{color: '#1B1B1B'}}>
                      2481, 2482, 2483, 2480, 2478, 2477, 2489
                    </div>
                  </div>
                  <div className="mt-3 text-sm" style={{color: '#4a5568'}}>
                    Don't see your area listed?{' '}
                    <a 
                      href="#contact"
                      className="font-medium underline hover:no-underline transition-all duration-200"
                      style={{color: '#d64f24'}}
                      onClick={(e) => {
                        e.preventDefault();
                        document.getElementById('contact')?.scrollIntoView({ 
                          behavior: 'smooth',
                          block: 'start'
                        });
                      }}
                    >
                      Contact us
                    </a>
                    {' '} - we may still service your location!
                  </div>
                </div>
              </div>

              {/* Item Selection - 2x2 Grid */}
              <div id="item-selection" className="border-t pt-6">
                {/* Knife Selection - Specialized Design */}
                <div className="text-center mb-8" style={{
                  marginBottom: 'clamp(24px, 6vw, 32px)'
                }}>
                  <h3 className="text-2xl font-bold mb-4" style={{
                    fontSize: 'clamp(1.5rem, 5vw, 2rem)',
                    fontWeight: 700,
                    color: '#1B1B1B',
                    marginBottom: 'clamp(12px, 3vw, 16px)'
                  }}>
                    How many items need sharpening?
                  </h3>
                  <p className="text-lg mb-2" style={{
                    fontSize: 'clamp(0.9rem, 2.5vw, 1.125rem)',
                    color: '#4a5568',
                    marginBottom: '8px'
                  }}>
                    Professional sharpening service - $15 per item
                  </p>
                  <p className="mb-6" style={{
                    marginBottom: 'clamp(16px, 4vw, 24px)'
                  }}>
                    <button
                      type="button"
                      className="font-medium transition-colors duration-200"
                      style={{
                        color: '#d64f24',
                        textDecoration: 'underline',
                        fontSize: 'clamp(0.875rem, 2.5vw, 1rem)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = '#b8431f';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = '#d64f24';
                      }}
                      onClick={() => setShowSharpenPopup(true)}
                    >
                      What do we sharpen?
                    </button>
                  </p>
                </div>
                


                {/* Centered Counter Design */}
                <div className="flex justify-center items-center mb-6" style={{
                  marginBottom: 'clamp(16px, 4vw, 24px)'
                }}>
                  <div className="flex items-center space-x-6" style={{
                    gap: 'clamp(16px, 4vw, 24px)'
                  }}>
                    <button 
                      type="button"
                      onClick={() => updateQuantity('items', -1)}
                      disabled={quantities.items <= 4}
                      className="flex items-center justify-center text-xl font-bold transition-all duration-200"
                      style={{
                        width: 'clamp(40px, 10vw, 48px)',
                        height: 'clamp(40px, 10vw, 48px)',
                        minWidth: '44px',
                        minHeight: '44px',
                        backgroundColor: quantities.items <= 4 ? '#f7fafc' : '#ffffff',
                        border: quantities.items <= 4 ? '1px solid #e2e8f0' : '1px solid #e2e8f0',
                        borderRadius: '8px',
                        color: quantities.items <= 4 ? '#cbd5e0' : '#1B1B1B',
                        cursor: quantities.items <= 4 ? 'not-allowed' : 'pointer',
                        boxShadow: quantities.items <= 4 ? 'none' : '0 2px 4px rgba(0,0,0,0.1)'
                      }}
                      onMouseEnter={(e) => {
                        if (quantities.items > 4) {
                          e.currentTarget.style.borderColor = '#d85025';
                          e.currentTarget.style.transform = 'scale(1.05)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (quantities.items > 4) {
                          e.currentTarget.style.borderColor = '#e2e8f0';
                          e.currentTarget.style.transform = 'scale(1)';
                        }
                      }}
                    >
                      -
                    </button>
                    <div className="text-center">
                      <div className="text-4xl font-bold mb-2" style={{
                        fontSize: 'clamp(2rem, 6vw, 2.5rem)',
                        fontWeight: 700,
                        color: '#1B1B1B',
                        marginBottom: '8px'
                      }}>
                        {quantities.items}
                      </div>

                    </div>
                    <button 
                      type="button"
                      onClick={() => updateQuantity('items', 1)}
                      className="flex items-center justify-center text-xl font-bold transition-all duration-200"
                      style={{
                        width: 'clamp(40px, 10vw, 48px)',
                        height: 'clamp(40px, 10vw, 48px)',
                        minWidth: '44px',
                        minHeight: '44px',
                        backgroundColor: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        color: '#1B1B1B',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = '#d85025';
                        e.currentTarget.style.transform = 'scale(1.05)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = '#e2e8f0';
                        e.currentTarget.style.transform = 'scale(1)';
                      }}
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Minimum Order Notice */}
                <div className="text-center mb-4" style={{
                  marginBottom: 'clamp(12px, 3vw, 16px)'
                }}>
                  <p className="text-sm" style={{
                    color: '#6b7280',
                    fontSize: 'clamp(0.75rem, 2vw, 0.875rem)'
                  }}>
                    Minimum 4 items
                  </p>
                </div>



                {/* Trust Badges */}
                <div className="text-center mb-6" style={{
                  marginBottom: 'clamp(16px, 4vw, 24px)'
                }}>
                  <div className="flex flex-wrap justify-center gap-3" style={{
                    gap: 'clamp(8px, 2vw, 12px)'
                  }}>
                    <div style={{
                      backgroundColor: 'rgba(248, 250, 252, 0.8)',
                      border: '1px solid #e2e8f0',
                      borderRadius: '20px',
                      padding: 'clamp(6px, 1.5vw, 8px) clamp(12px, 3vw, 16px)',
                      fontSize: 'clamp(0.8rem, 2.2vw, 0.9rem)',
                      color: '#4a5568',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}>
                      <span style={{
                        color: '#d64f24', 
                        fontSize: 'clamp(0.875rem, 2.5vw, 1rem)'
                      }}>✓</span>
                      Expert Assessment
                    </div>
                    <div style={{
                      backgroundColor: 'rgba(248, 250, 252, 0.8)',
                      border: '1px solid #e2e8f0',
                      borderRadius: '20px',
                      padding: 'clamp(6px, 1.5vw, 8px) clamp(12px, 3vw, 16px)',
                      fontSize: 'clamp(0.8rem, 2.2vw, 0.9rem)',
                      color: '#4a5568',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}>
                      <span style={{
                        color: '#d64f24', 
                        fontSize: 'clamp(0.875rem, 2.5vw, 1rem)'
                      }}>✓</span>
                      Results Guaranteed
                    </div>
                    <div style={{
                      backgroundColor: 'rgba(248, 250, 252, 0.8)',
                      border: '1px solid #e2e8f0',
                      borderRadius: '20px',
                      padding: 'clamp(6px, 1.5vw, 8px) clamp(12px, 3vw, 16px)',
                      fontSize: 'clamp(0.8rem, 2.2vw, 0.9rem)',
                      color: '#4a5568',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}>
                      <span style={{
                        color: '#d64f24', 
                        fontSize: 'clamp(0.875rem, 2.5vw, 1rem)'
                      }}>✓</span>
                      24H Turnaround
                    </div>
                  </div>
                </div>



                {/* Running Total */}
                <div className="border border-gray-200 rounded-lg p-4 md:p-6" style={{
                  backgroundColor: '#f8fafc',
                  borderRadius: '8px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  marginBottom: 'clamp(16px, 4vw, 24px)',
                  borderColor: '#d64f24',
                  borderWidth: '2px',
                  padding: 'clamp(12px, 3vw, 16px) clamp(16px, 4vw, 24px)'
                }}>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-lg font-semibold" style={{
                      color: '#1B1B1B',
                      fontSize: 'clamp(1rem, 2.5vw, 1.125rem)'
                    }}>Total:</span>
                    <span className="text-2xl font-bold" style={{
                      color: '#d64f24',
                      fontSize: 'clamp(1.5rem, 4vw, 1.75rem)',
                      fontWeight: 700
                    }}>
                      ${total.toFixed(2)}
                    </span>
                  </div>
                  <div className="text-left">
                    <p className="text-sm" style={{
                      color: '#6b7280', 
                      lineHeight: '1.5',
                      fontSize: 'clamp(0.75rem, 2vw, 0.875rem)'
                    }}>
                      {quantities.items} items × $15 each
                    </p>
                  </div>
                </div>
              </div>

              {/* Item Selection Error */}
              {errors.items && (
                <div className="text-center py-4">
                  <div className="text-sm text-red-600">
                    <p>• {errors.items}</p>
                  </div>
                </div>
              )}

              {/* Progress Indicator */}
              <div className="text-center mb-4">
                <span className="text-sm font-medium" style={{color: '#6b7280'}}>
                  Step 1 of 2
                </span>
              </div>

              {/* Next Button */}
              <div className="text-center" style={{marginTop: '24px'}}>
                <button 
                  type="submit"
                  className="text-white rounded-lg transition-all duration-200 cursor-pointer"
                  style={{
                    backgroundColor: '#d64f24',
                    padding: '16px 32px',
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    borderRadius: '6px',
                    minHeight: '44px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#b8431f';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#d64f24';
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.outline = '3px solid #4983a6';
                    e.currentTarget.style.outlineOffset = '2px';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.outline = 'none';
                  }}
                >
                  NEXT
                </button>
              </div>
            </form>
              </div>
          </Card>
                      ) : (
            /* STEP 2: Upsells Display Section */
            <Card className="p-8 bg-white rounded-3xl shadow-lg">
              <div className="space-y-8" style={{marginBottom: '32px'}}>
                {/* ORDER SUMMARY */}
                <div className="border-b pb-6" style={{marginBottom: '32px'}}>
                  <h3 className="text-xl font-semibold mb-6" style={{color: '#1B1B1B'}}>ORDER SUMMARY</h3>
                  {/* Customer Info Card */}
                  <div className="bg-gray-50 rounded-lg p-5 mb-6" style={{
                    backgroundColor: '#f8fafc',
                    borderRadius: '8px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                  }}>
                                          <div className="flex justify-between items-start mb-4">
                        <div>
                          <div className="text-lg font-semibold mb-1" style={{color: '#1B1B1B'}}>
                            Delivering to: {firstName} {lastName}
                          </div>
                          <div className="text-sm" style={{color: '#4a5568', lineHeight: '1.5'}}>
                            {address}
                          </div>
                        </div>
                        <button 
                          onClick={handleBackToOrder}
                          className="text-sm font-medium underline transition-colors duration-200"
                          style={{
                            color: '#d64f24'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.color = '#b8431f';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.color = '#d64f24';
                          }}
                        >
                          Edit
                        </button>
                      </div>
                      <div className="text-sm mb-3" style={{color: '#4a5568', lineHeight: '1.5'}}>
                        {getItemCount()} items selected for sharpening
                      </div>
                      <div className="text-lg font-semibold" style={{color: '#1B1B1B'}}>
                        Subtotal: ${getSubtotal().toFixed(2)}
                      </div>
                  </div>
                </div>

                {/* STEP 1: Service Bundle Options */}
                <div className="border-b pb-6" style={{marginBottom: '32px'}}>
                  <h3 className="text-xl font-semibold mb-6" style={{color: '#1B1B1B'}}>UPGRADE</h3>
                  
                  {/* STEP 1: Simplified Two-Card Layout */}
                  <div className="mb-8">
                    
                    {/* Bundle Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      {Object.entries(serviceBundles).map(([bundleKey, bundle]) => {
                        const isSelected = applyToAll === bundleKey;
                        const isPremium = bundleKey === 'premium';
                        
                        return (
                          <div
                            key={bundleKey}
                            className={`relative border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                              isSelected 
                                ? 'border-blue-500 bg-blue-50 shadow-lg' 
                                : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                            } ${isPremium ? 'ring-2 ring-blue-200' : ''}`}
                            style={{
                              padding: '24px',
                              borderWidth: isSelected ? '3px' : '2px',
                              backgroundColor: isSelected ? 'rgba(59, 130, 246, 0.05)' : undefined,
                              borderRadius: '8px',
                              boxShadow: isSelected ? '0 2px 8px rgba(0,0,0,0.06)' : undefined
                            }}
                            onClick={() => handleApplyToAll(bundleKey)}
                          >
                            {/* Badge for Popular */}
                            {'badge' in bundle && bundle.badge && (
                              <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                                <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                                  {bundle.badge}
                                </span>
                              </div>
                            )}
                            
                            {/* Card Header */}
                            <div className="text-center mb-4">
                              <div className="text-4xl mb-3">{bundle.icon}</div>
                              <h5 className="text-xl font-bold mb-2" style={{color: '#1B1B1B'}}>
                                {bundle.title}
                              </h5>
                              <div className={`font-semibold ${
                                bundle.price === 0 
                                  ? 'text-green-600 text-lg' 
                                  : 'text-blue-600 text-xl font-bold'
                              }`}>
                                {bundle.price === 0 ? (
                                  <span className="inline-flex items-center">
                                    <span className="mr-1">✓</span>
                                    {bundle.priceText}
                                  </span>
                                ) : (
                                  bundle.priceText
                                )}
                              </div>
                            </div>
                            
                            {/* Description */}
                            <p className="text-sm text-center mb-4" style={{color: '#4a5568', lineHeight: '1.5'}}>
                              {bundle.description}
                            </p>
                            
                            {/* Benefits List */}
                            <ul className="space-y-2" style={{marginTop: '16px'}}>
                              {bundle.benefits.map((benefit, index) => (
                                <li key={index} className="flex items-center text-sm" style={{
                                  color: '#4a5568',
                                  marginBottom: '8px',
                                  lineHeight: '1.5'
                                }}>
                                  <span className="text-green-500 mr-2">✓</span>
                                  {benefit}
                                </li>
                              ))}
                            </ul>
                            
                            {/* Selection Indicator */}
                            {isSelected && (
                              <div className="absolute top-3 right-3">
                                <div className="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center">
                                  <span className="text-white text-sm">✓</span>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    
                    {/* STEP 3: Simple Apply Logic */}
                    <div className="text-center">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                        <div className="text-lg font-bold" style={{color: '#1B1B1B'}}>
                          {applyToAll === 'premium' ? `Total upgrade: +$${(serviceBundles[applyToAll as keyof typeof serviceBundles].price * getItemCount()).toFixed(2)}` : 'No additional cost'}
                        </div>
                      </div>
                    </div>
                  </div>


                </div>

                {/* DELIVERY */}
                <div className="border-b pb-6" style={{marginBottom: '32px'}}>
                  <h3 className="text-xl font-semibold mb-6" style={{color: '#1B1B1B'}}>DELIVERY</h3>
                  
                  {/* Unified Delivery Card */}
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-6" style={{
                    backgroundColor: '#f8fafc',
                    borderRadius: '8px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                  }}>
                    {/* Current Delivery Fee */}
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-lg font-semibold" style={{color: '#1B1B1B'}}>Delivery Fee:</span>
                      <span className={`text-xl font-bold ${hasFreeDelivery() ? 'text-green-600' : ''}`}>
                        {hasFreeDelivery() ? 'FREE' : `$${getDeliveryFee().toFixed(2)}`}
                      </span>
                    </div>

                    {/* Next Pickup Date */}
                    <div className="flex items-center space-x-2 mb-4">
                      <span className="text-lg">🚚</span>
                      <span className="text-base font-medium" style={{color: '#1B1B1B', lineHeight: '1.5'}}>
                        Next pickup: {nextPickupDay}
                      </span>
                    </div>

                    {/* Progress Bar for Free Delivery */}
                    {!hasFreeDelivery() && (
                      <div className="mb-3">
                        <div className="flex justify-between text-sm mb-2">
                          <span style={{color: '#4a5568', lineHeight: '1.5'}}>Progress to free delivery:</span>
                          <span style={{color: '#4a5568', lineHeight: '1.5'}}>${getCurrentSubtotal().toFixed(2)} / $80.00</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="h-2 rounded-full transition-all duration-300"
                            style={{
                              width: `${Math.min((getCurrentSubtotal() / 80) * 100, 100)}%`,
                              backgroundColor: '#d64f24'
                            }}
                          ></div>
                        </div>
                        <div className="text-sm mt-2" style={{color: '#4a5568', lineHeight: '1.5'}}>
                          Add ${getRemainingForFreeDelivery().toFixed(2)} more for FREE pickup & delivery
                        </div>
                      </div>
                    )}

                    {/* Free Delivery Achieved */}
                    {hasFreeDelivery() && (
                      <div className="flex items-center space-x-2">
                        <span className="text-green-600 text-lg">✅</span>
                        <span className="text-sm font-medium text-green-800">
                          Free pickup & delivery included
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* SPECIAL INSTRUCTIONS */}
                <div className="border-b pb-6" style={{marginBottom: '32px'}}>
                  <h3 className="text-xl font-semibold mb-6" style={{color: '#1B1B1B'}}>SPECIAL INSTRUCTIONS</h3>
                  <div>
                    <textarea 
                      value={specialInstructions}
                      onChange={(e) => setSpecialInstructions(e.target.value)}
                      placeholder="Enter gate codes, specific pickup location (e.g., 'leave on front porch'), or any special requests..."
                      rows={4}
                      className="w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none transition-all duration-200 hover:border-gray-400"
                      style={{
                        borderRadius: '6px',
                        lineHeight: '1.5',
                        color: '#4a5568',
                        padding: '12px',
                        backgroundColor: '#f8fafc',
                        borderColor: '#e2e8f0'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#4983a6';
                        e.target.style.boxShadow = '0 0 0 3px rgba(73, 131, 166, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#e2e8f0';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                    <div className="text-xs text-gray-500 mt-2" style={{color: '#4a5568'}}>
                      Optional: Add any special instructions for pickup or delivery
                    </div>
                  </div>
                </div>

                {/* FINAL TOTAL */}
                <div className="border border-gray-200 rounded-lg p-6" style={{
                  backgroundColor: '#f8fafc',
                  borderRadius: '8px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  marginBottom: '32px'
                }}>
                  <h3 className="text-xl font-semibold mb-6" style={{color: '#1B1B1B'}}>TOTAL BREAKDOWN</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center" style={{color: '#4a5568', lineHeight: '1.5'}}>
                      <span className="text-base">Base Items:</span>
                      <span className="text-base font-medium">${getSubtotal().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center" style={{color: '#4a5568', lineHeight: '1.5'}}>
                      <span className="text-base">Additional Services:</span>
                      <span className="text-base font-medium">${getUpsellsCost().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center" style={{color: '#4a5568', lineHeight: '1.5'}}>
                      <span className="text-base">Delivery:</span>
                      <span className={`text-base font-medium ${hasFreeDelivery() ? "text-green-600" : ""}`}>
                        {hasFreeDelivery() ? 'FREE' : `$${getDeliveryFee().toFixed(2)}`}
                      </span>
                    </div>
                    <div className="border-t border-gray-300 pt-4 flex justify-between items-center">
                      <span className="text-lg font-semibold" style={{color: '#1B1B1B'}}>Total:</span>
                      <span className="text-2xl font-bold" style={{
                        color: '#1B1B1B',
                        fontSize: '1.5rem',
                        fontWeight: 700
                      }}>
                        ${finalTotal.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* STEP 3: Navigation Controls */}
                <div className="flex justify-between items-center pt-8" style={{gap: '20px'}}>
                  <button
                    onClick={handleBackToOrder}
                    className="px-8 py-4 text-lg font-medium bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 shadow-sm hover:shadow-md"
                    style={{
                      color: '#6b7280'
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.outline = '3px solid #4983a6';
                      e.currentTarget.style.outlineOffset = '2px';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.outline = 'none';
                    }}
                  >
                    ← Back to Order
                  </button>
                  <button
                    onClick={handleCompleteBooking}
                    className="text-white rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                    style={{
                      backgroundColor: '#d64f24',
                      padding: '16px 40px',
                      fontSize: '1.1rem',
                      fontWeight: 'bold'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#b8431f';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#d64f24';
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.outline = '3px solid #4983a6';
                      e.currentTarget.style.outlineOffset = '2px';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.outline = 'none';
                    }}
                  >
                    Complete Booking
                  </button>
                </div>
              </div>
            </Card>
          )}
        </div>
      </section>

      {/* SECTION 6 - About Me */}
      <section className="py-16 md:py-20 lg:py-24" style={{
        backgroundColor: '#013350',
        paddingTop: '80px',
        paddingBottom: '80px',
        borderTop: '1px solid rgba(255,255,255,0.1)',
        borderBottom: '1px solid rgba(255,255,255,0.1)'
      }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-12" style={{
            color: '#ffffff',
            fontSize: 'clamp(2rem, 5vw, 2.5rem)',
            fontWeight: 700,
            letterSpacing: '1px',
            textShadow: '2px 2px 4px rgba(0,0,0,0.1)'
          }}>About Me</h2>
          
          <div className="bg-white rounded-3xl shadow-lg p-8 md:p-10">
            <div className="text-lg space-y-6 leading-relaxed" style={{color: '#1B1B1B'}}>
              <p>
                Hi there! I'm passionate about keeping your knives in top shape. There's nothing quite like the satisfaction of a perfectly sharp blade that glides through tomatoes and makes cooking a joy again.
              </p>
              <p>
                I've been sharpening knives for years, and I still get excited when I see the difference a proper edge makes. Whether it's your favorite chef's knife, garden shears, or that pocket knife passed down from grandpa - I treat every blade with the care it deserves.
              </p>
              <p>
                My mobile service means you don't have to worry about dropping off and picking up. Just leave your knives safely on your porch Monday morning, and I'll have them back to you sharp as new within 72 hours. It's that simple.
              </p>
              <p>
                I serve the beautiful Northern Rivers region because this community deserves tools that work as hard as they do. Sharp knives aren't just safer - they make every meal prep easier and more enjoyable.
              </p>
              
              <div className="text-right mt-8 pt-6 border-t border-gray-200">
                <p className="text-xl font-semibold italic" style={{color: '#013350'}}>
                  Hakeem Manco, Founder
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 7 - Contact Form */}
      <section id="contact" className="py-16 md:py-20 lg:py-24" style={{
        backgroundColor: '#fff8e8',
        paddingTop: '80px',
        paddingBottom: '80px'
      }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-12" style={{
            color: '#013350',
            fontSize: 'clamp(2rem, 5vw, 2.5rem)',
            fontWeight: 700,
            letterSpacing: '1px',
            textShadow: '2px 2px 4px rgba(0,0,0,0.1)'
          }}>Questions? Get in Touch</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Contact Form */}
            <div className="bg-white rounded-3xl shadow-lg p-8">
              <form onSubmit={handleContactSubmit} className="space-y-6">
                <div>
                  <label htmlFor="contact-name" className="block text-sm font-medium mb-2" style={{color: '#013350'}}>
                    Name
                  </label>
                  <input
                    type="text"
                    id="contact-name"
                    name="name"
                    value={contactForm.name}
                    onChange={(e) => setContactForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    style={{
                      backgroundColor: '#f8fafc',
                      color: '#1B1B1B'
                    }}
                    placeholder="Your name"
                    required
                    disabled={contactForm.isSubmitting}
                  />
                </div>
                
                <div>
                  <label htmlFor="contact-email" className="block text-sm font-medium mb-2" style={{color: '#013350'}}>
                    Email
                  </label>
                  <input
                    type="email"
                    id="contact-email"
                    name="email"
                    value={contactForm.email}
                    onChange={(e) => setContactForm(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    style={{
                      backgroundColor: '#f8fafc',
                      color: '#1B1B1B'
                    }}
                    placeholder="your.email@example.com"
                    required
                    disabled={contactForm.isSubmitting}
                  />
                </div>
                
                <div>
                  <label htmlFor="contact-message" className="block text-sm font-medium mb-2" style={{color: '#013350'}}>
                    Message
                  </label>
                  <textarea
                    id="contact-message"
                    name="message"
                    rows={4}
                    value={contactForm.message}
                    onChange={(e) => setContactForm(prev => ({ ...prev, message: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                    style={{
                      backgroundColor: '#f8fafc',
                      color: '#1B1B1B'
                    }}
                    placeholder="How can I help you?"
                    required
                    disabled={contactForm.isSubmitting}
                  ></textarea>
                </div>

                {/* Error Message */}
                {contactForm.error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-red-600 text-sm">{contactForm.error}</p>
                  </div>
                )}

                {/* Success Message */}
                {contactForm.success && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <p className="text-green-600 text-sm">{contactForm.success}</p>
                  </div>
                )}
                
                <button
                  type="submit"
                  disabled={contactForm.isSubmitting}
                  className="w-full text-white font-semibold rounded-lg transition-all duration-200 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    backgroundColor: '#d64f24',
                    padding: '14px 32px',
                    fontSize: '1rem',
                    fontWeight: 600
                  }}
                  onMouseEnter={(e) => {
                    if (!contactForm.isSubmitting) {
                      e.currentTarget.style.backgroundColor = '#b8431f';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!contactForm.isSubmitting) {
                      e.currentTarget.style.backgroundColor = '#d64f24';
                    }
                  }}
                >
                  {contactForm.isSubmitting ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </div>
            
            {/* Contact Information */}
            <div className="space-y-8">
              <div>
                <h3 className="text-2xl font-bold mb-6" style={{color: '#013350'}}>
                  Other Ways to Reach Us
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{backgroundColor: '#013350'}}>
                      <span style={{fontSize: '20px'}}>📞</span>
                    </div>
                    <div>
                      <p className="font-semibold" style={{color: '#013350'}}>Phone</p>
                      <a 
                        href="tel:0451494922"
                        className="text-lg hover:text-blue-600 transition-colors duration-200"
                        style={{color: '#d64f24'}}
                      >
                        0451 494 922
                      </a>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{backgroundColor: '#013350'}}>
                      <span style={{fontSize: '20px'}}>✉️</span>
                    </div>
                    <div>
                      <p className="font-semibold" style={{color: '#013350'}}>Email</p>
                      <a 
                        href="mailto:manco.hakeem@gmail.com"
                        className="text-lg hover:text-blue-600 transition-colors duration-200"
                        style={{color: '#d64f24'}}
                      >
                        manco.hakeem@gmail.com
                      </a>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{backgroundColor: '#013350'}}>
                      <span style={{fontSize: '20px'}}>📘</span>
                    </div>
                    <div>
                      <p className="font-semibold" style={{color: '#013350'}}>Facebook</p>
                      <a 
                        href="https://www.facebook.com/northernriversknifesharpening"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-lg hover:text-blue-600 transition-colors duration-200"
                        style={{color: '#d64f24'}}
                      >
                        Northern Rivers Knife Sharpening
                      </a>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-2xl p-6 shadow-md">
                <h4 className="font-semibold mb-3" style={{color: '#013350'}}>Service Area</h4>
                <p className="text-sm" style={{color: '#4a5568', lineHeight: '1.6'}}>
                  🚚 Serving postcodes 2481-2489 • 24-hour turnaround
                </p>
                <p className="text-sm mt-2" style={{color: '#4a5568', lineHeight: '1.6'}}>
                  ⏰ Available 7 days a week
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>



      {/* What Do We Sharpen Popup */}
      {showSharpenPopup && (
        <div 
          className="fixed inset-0 flex items-center justify-center z-50 p-4 transition-all duration-300 ease-out"
          style={{
            background: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)'
          }}
          onClick={() => setShowSharpenPopup(false)}
        >
          <div 
            className="bg-white rounded-2xl max-w-md w-full max-h-[85vh] overflow-y-auto transition-all duration-300 ease-out"
            style={{
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
              transform: 'scale(1)',
              animation: 'modalEnter 0.3s ease-out'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-100">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold" style={{
                  color: '#1B1B1B',
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  lineHeight: '1.3'
                }}>
                  What Do We Sharpen?
                </h2>
                <button
                  onClick={() => setShowSharpenPopup(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full transition-all duration-200 hover:bg-gray-100"
                  style={{
                    color: '#6b7280',
                    fontSize: '20px',
                    lineHeight: '1'
                  }}
                  aria-label="Close modal"
                >
                  ×
                </button>
              </div>
            </div>
            
            {/* Content */}
            <div className="p-6 space-y-5">
              {/* Kitchen Items Section */}
              <div className="p-4 rounded-lg" style={{
                backgroundColor: 'rgba(248, 250, 252, 0.5)',
                border: '1px solid rgba(0,0,0,0.08)'
              }}>
                <h3 className="text-lg font-semibold mb-3 flex items-center" style={{
                  color: '#1B1B1B',
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  lineHeight: '1.4'
                }}>
                  <span className="mr-2" style={{fontSize: '1.2rem'}}>🍴</span>
                  Kitchen Items
                </h3>
                <ul className="space-y-2" style={{color: '#4a5568'}}>
                  <li className="text-sm leading-relaxed" style={{lineHeight: '1.5'}}>• Chef knives and paring knives</li>
                  <li className="text-sm leading-relaxed" style={{lineHeight: '1.5'}}>• Bread knives and steak knives</li>
                  <li className="text-sm leading-relaxed" style={{lineHeight: '1.5'}}>• Kitchen scissors and shears</li>
                  <li className="text-sm leading-relaxed" style={{lineHeight: '1.5'}}>• Meat cleavers and utility knives</li>
                  <li className="text-sm leading-relaxed" style={{lineHeight: '1.5'}}>• Scissors for fabric and paper</li>
                </ul>
              </div>

              {/* Garden Tools Section */}
              <div className="p-4 rounded-lg" style={{
                backgroundColor: 'rgba(248, 250, 252, 0.5)',
                border: '1px solid rgba(0,0,0,0.08)'
              }}>
                <h3 className="text-lg font-semibold mb-3 flex items-center" style={{
                  color: '#1B1B1B',
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  lineHeight: '1.4'
                }}>
                  <span className="mr-2" style={{fontSize: '1.2rem'}}>🌿</span>
                  Garden Tools
                </h3>
                <ul className="space-y-2" style={{color: '#4a5568'}}>
                  <li className="text-sm leading-relaxed" style={{lineHeight: '1.5'}}>• Hedge trimmers and pruning shears</li>
                  <li className="text-sm leading-relaxed" style={{lineHeight: '1.5'}}>• Garden scissors and secateurs</li>
                  <li className="text-sm leading-relaxed" style={{lineHeight: '1.5'}}>• Lawn mower blades</li>
                  <li className="text-sm leading-relaxed" style={{lineHeight: '1.5'}}>• Axes and hatchets</li>
                  <li className="text-sm leading-relaxed" style={{lineHeight: '1.5'}}>• Machetes and bush knives</li>
                </ul>
              </div>

              {/* Other Tools Section */}
              <div className="p-4 rounded-lg" style={{
                backgroundColor: 'rgba(248, 250, 252, 0.5)',
                border: '1px solid rgba(0,0,0,0.08)'
              }}>
                <h3 className="text-lg font-semibold mb-3 flex items-center" style={{
                  color: '#1B1B1B',
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  lineHeight: '1.4'
                }}>
                  <span className="mr-2" style={{fontSize: '1.2rem'}}>🛠️</span>
                  Other Tools
                </h3>
                <ul className="space-y-2" style={{color: '#4a5568'}}>
                  <li className="text-sm leading-relaxed" style={{lineHeight: '1.5'}}>• Pocket knives and hunting knives</li>
                  <li className="text-sm leading-relaxed" style={{lineHeight: '1.5'}}>• Fishing knives and fillet knives</li>
                </ul>
              </div>

              {/* What We Don't Sharpen Section */}
              <div className="p-4 rounded-lg" style={{
                backgroundColor: 'rgba(254, 226, 226, 0.5)',
                border: '1px solid rgba(239, 68, 68, 0.2)'
              }}>
                <h3 className="text-lg font-semibold mb-3 flex items-center" style={{
                  color: '#dc2626',
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  lineHeight: '1.4'
                }}>
                  <span className="mr-2" style={{fontSize: '1.2rem'}}>❌</span>
                  What We Don't Sharpen
                </h3>
                <ul className="space-y-2" style={{color: '#4a5568'}}>
                  <li className="text-sm leading-relaxed" style={{lineHeight: '1.5'}}>• Chainsaws</li>
                  <li className="text-sm leading-relaxed" style={{lineHeight: '1.5'}}>• Hair or fur clipper blades</li>
                  <li className="text-sm leading-relaxed" style={{lineHeight: '1.5'}}>• Salon scissors</li>
                </ul>
              </div>

              {/* Note Section */}
              <div className="p-4 rounded-lg" style={{
                backgroundColor: 'rgba(254, 243, 199, 0.3)',
                border: '1px solid rgba(245, 158, 11, 0.2)'
              }}>
                <p className="text-sm leading-relaxed" style={{
                  color: '#d64f24',
                  lineHeight: '1.5'
                }}>
                  <strong>Note:</strong> If you're unsure about a specific item, feel free to contact us and we'll let you know if we can help!
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-100">
              <button
                onClick={() => setShowSharpenPopup(false)}
                className="w-full text-white font-semibold rounded-lg transition-all duration-200 hover:shadow-lg"
                style={{
                  backgroundColor: '#d64f24',
                  padding: '12px 32px',
                  fontSize: '1rem',
                  fontWeight: 600
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#b8431f';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#d64f24';
                }}
                onFocus={(e) => {
                  e.currentTarget.style.outline = '3px solid #4983a6';
                  e.currentTarget.style.outlineOffset = '2px';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.outline = 'none';
                }}
              >
                Got it!
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes modalEnter {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  )
}