'use client'

import React, { useState, useEffect } from 'react'
import Button from './ui/Button'

export default function Footer() {
  const [openSections, setOpenSections] = useState({
    quickLinks: false,
    businessInfo: false,
  })
  const [showBackToTop, setShowBackToTop] = useState(false)
  const [formState, setFormState] = useState({
    name: '',
    phone: '',
    message: ''
  })
  const [formStatus, setFormStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  const toggleSection = (section: 'quickLinks' | 'businessInfo') => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const validateForm = () => {
    const errors: Record<string, string> = {}
    
    if (!formState.name.trim()) errors.name = 'Name is required'
    if (!formState.phone.trim()) errors.phone = 'Phone number is required'
    else if (!/^[\d\s\-\+\(\)]+$/.test(formState.phone.trim())) errors.phone = 'Please enter a valid phone number'
    if (!formState.message.trim()) errors.message = 'Message is required'
    
    return errors
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const errors = validateForm()
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }
    
    setFormStatus('loading')
    setFormErrors({})
    
    // Submit contact form
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formState)
      })
      
      if (response.ok) {
        setFormStatus('success')
        setFormState({ name: '', phone: '', message: '' })
        setTimeout(() => setFormStatus('idle'), 3000)
      } else {
        throw new Error('Failed to send message')
      }
    } catch {
      setFormStatus('error')
      setTimeout(() => setFormStatus('idle'), 3000)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormState(prev => ({ ...prev, [field]: value }))
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
      {/* Customer Testimonial Quote */}
      <section className="relative" style={{ backgroundColor: '#fff8e8' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-12">
          <div className="backdrop-blur-sm bg-white/50 border border-white/20 shadow-2xl rounded-2xl p-8 transform hover:scale-[1.02] transition-all duration-300" style={{ boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1)' }}>
            <div className="text-center">
              <div className="text-6xl mb-4" style={{ color: '#BF5630' }}>❝</div>
              <blockquote className="text-xl italic text-gray-800 mb-6 leading-relaxed">
                The mobile workshop service is incredible! Hakeem came right to my driveway and had my knives razor-sharp in under an hour. Professional, convenient, and the results speak for themselves.
              </blockquote>
              <cite className="text-lg font-semibold" style={{ color: '#013350' }}>
                — Sarah M., Byron Bay
              </cite>
            </div>
          </div>
        </div>
      </section>

      <footer style={{ backgroundColor: '#013350' }} className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Footer Container */}
          <div className="shadow-lg rounded-3xl p-8 lg:p-12" style={{ backgroundColor: '#f4f2ec' }}>
            {/* Responsive Grid Layout */}
            <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-8 lg:gap-12">
              
              {/* Column 1: Contact Form */}
              <div id="contact" className="space-y-6">
                <h3 className="text-2xl font-bold" style={{ 
                  fontFamily: 'Comic Relief, sans-serif', 
                  color: '#013350' 
                }}>
                  Get in Touch
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {formStatus === 'success' && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-green-700 font-semibold">✓ Message sent successfully!</p>
                      <p className="text-green-600 text-sm">I'll get back to you soon.</p>
                    </div>
                  )}
                  {formStatus === 'error' && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-red-700 font-semibold">✗ Something went wrong</p>
                      <p className="text-red-600 text-sm">Please try again or call me directly on 0451 494 922.</p>
                    </div>
                  )}
                  <div>
                    <input
                      type="text"
                      placeholder="Your Name"
                      value={formState.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 ${
                        formErrors.name 
                          ? 'border-red-300 focus:ring-red-500' 
                          : 'border-gray-300 focus:ring-blue-600'
                      } focus:outline-none focus:ring-2 focus:border-transparent`}
                    />
                    {formErrors.name && (
                      <p className="text-red-600 text-sm mt-1">{formErrors.name}</p>
                    )}
                  </div>
                  <div>
                    <input
                      type="tel"
                      placeholder="Phone Number"
                      value={formState.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 ${
                        formErrors.phone 
                          ? 'border-red-300 focus:ring-red-500' 
                          : 'border-gray-300 focus:ring-blue-600'
                      } focus:outline-none focus:ring-2 focus:border-transparent`}
                    />
                    {formErrors.phone && (
                      <p className="text-red-600 text-sm mt-1">{formErrors.phone}</p>
                    )}
                  </div>
                  <div>
                    <textarea
                      placeholder="Your Message"
                      rows={4}
                      value={formState.message}
                      onChange={(e) => handleInputChange('message', e.target.value)}
                      className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 resize-none ${
                        formErrors.message 
                          ? 'border-red-300 focus:ring-red-500' 
                          : 'border-gray-300 focus:ring-blue-600'
                      } focus:outline-none focus:ring-2 focus:border-transparent`}
                    ></textarea>
                    {formErrors.message && (
                      <p className="text-red-600 text-sm mt-1">{formErrors.message}</p>
                    )}
                  </div>
                  <Button 
                    variant="primary" 
                    type="submit"
                    loading={formStatus === 'loading'}
                    disabled={formStatus === 'loading'}
                    className="w-full transform hover:scale-105 transition-transform duration-200"
                    style={{
                      backgroundColor: '#d64f24',
                      borderColor: '#d64f24'
                    }}
                    onMouseEnter={(e) => {
                      if (formStatus !== 'loading') {
                        e.currentTarget.style.backgroundColor = '#b8431f';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (formStatus !== 'loading') {
                        e.currentTarget.style.backgroundColor = '#d64f24';
                      }
                    }}
                  >
                    {formStatus === 'loading' ? 'Sending...' : 'Send Message'}
                  </Button>
                </form>
              </div>

              {/* Column 2: Quick Links */}
              <div className="space-y-6">
                <h3 className="text-2xl font-bold" style={{ 
                  fontFamily: 'Comic Relief, sans-serif', 
                  color: '#013350' 
                }}>
                  Quick Navigation
                </h3>
                <ul className="space-y-3">
                  <li>
                    <button
                      onClick={() => scrollToSection('how-it-works')}
                      className="flex items-center text-gray-700 hover:text-blue-600 transition-all duration-200 group transform hover:translate-x-2"
                    >
                      <svg className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                      How It Works
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => scrollToSection('testimonials')}
                      className="flex items-center text-gray-700 hover:text-blue-600 transition-all duration-200 group transform hover:translate-x-2"
                    >
                      <svg className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                      Client Testimonials
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => scrollToSection('booking')}
                      className="flex items-center text-gray-700 hover:text-blue-600 transition-all duration-200 group transform hover:translate-x-2"
                    >
                      <svg className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                      Book Now
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => scrollToSection('about')}
                      className="flex items-center text-gray-700 hover:text-blue-600 transition-all duration-200 group transform hover:translate-x-2"
                    >
                      <svg className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                      About Me
                    </button>
                  </li>
                </ul>
              </div>

              {/* Column 3: Business Info */}
              <div className="space-y-6">
                <h3 className="text-2xl font-bold" style={{ 
                  fontFamily: 'Comic Relief, sans-serif', 
                  color: '#013350' 
                }}>
                  Business Information
                </h3>
                <div className="space-y-4">
                  {/* Trust Badges Section */}
                  <div className="grid grid-cols-1 gap-3 mb-6">
                    <div className="backdrop-blur-sm bg-green-50/60 border border-green-200/50 rounded-lg p-3 flex items-center space-x-2">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      <span className="text-green-700 font-semibold text-sm">Fully Insured Business</span>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Business Hours</h4>
                    <p className="text-gray-600 text-sm">Monday - Saturday: 7:00 AM - 5:00 PM</p>
                    <p className="text-gray-600 text-sm">Sunday: Closed</p>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-gray-200 my-4"></div>
                  
                  <div className="flex items-center space-x-2">
                    <svg className="w-5 h-5 text-blue-600 hover:animate-pulse transition-all duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span className="text-gray-700 text-sm">0451 494 922</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span className="text-gray-700 text-sm">manco.hakeem@gmail.com</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <svg className="w-5 h-5 text-blue-600 hover:scale-110 transition-transform duration-200" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    <span className="text-gray-700 text-sm">Northern Rivers Knife Sharpening</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="text-gray-700 text-sm">ABN: 61 217 603 910</span>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Service Areas</h4>
                    <p className="text-gray-600 text-sm">Postcodes: 2481, 2482, 2483, 2480, 2478, 2477, 2489</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Layout with Enhanced Animations */}
            <div className="md:hidden space-y-6">
              
              {/* Contact Form - Always Visible on Mobile */}
              <div className="space-y-6">
                <h3 className="text-2xl font-bold" style={{ 
                  fontFamily: 'Comic Relief, sans-serif', 
                  color: '#013350' 
                }}>
                  Get in Touch
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <input
                      type="text"
                      placeholder="Your Name"
                      value={formState.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 ${
                        formErrors.name 
                          ? 'border-red-300 focus:ring-red-500' 
                          : 'border-gray-300 focus:ring-blue-600'
                      } focus:outline-none focus:ring-2 focus:border-transparent`}
                      required
                    />
                    {formErrors.name && (
                      <p className="text-red-600 text-sm mt-1">{formErrors.name}</p>
                    )}
                  </div>
                  <div>
                    <input
                      type="tel"
                      placeholder="Phone Number"
                      value={formState.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 ${
                        formErrors.phone 
                          ? 'border-red-300 focus:ring-red-500' 
                          : 'border-gray-300 focus:ring-blue-600'
                      } focus:outline-none focus:ring-2 focus:border-transparent`}
                      required
                    />
                    {formErrors.phone && (
                      <p className="text-red-600 text-sm mt-1">{formErrors.phone}</p>
                    )}
                  </div>
                  <div>
                    <textarea
                      placeholder="Your Message"
                      rows={4}
                      value={formState.message}
                      onChange={(e) => handleInputChange('message', e.target.value)}
                      className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 resize-none ${
                        formErrors.message 
                          ? 'border-red-300 focus:ring-red-500' 
                          : 'border-gray-300 focus:ring-blue-600'
                      } focus:outline-none focus:ring-2 focus:border-transparent`}
                      required
                    ></textarea>
                    {formErrors.message && (
                      <p className="text-red-600 text-sm mt-1">{formErrors.message}</p>
                    )}
                  </div>
                  <Button 
                    variant="primary" 
                    type="submit"
                    loading={formStatus === 'loading'}
                    disabled={formStatus === 'loading'}
                    className="w-full transform hover:scale-105 active:scale-95 transition-transform duration-200"
                    style={{
                      backgroundColor: '#d64f24',
                      borderColor: '#d64f24'
                    }}
                    onMouseEnter={(e) => {
                      if (formStatus !== 'loading') {
                        e.currentTarget.style.backgroundColor = '#b8431f';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (formStatus !== 'loading') {
                        e.currentTarget.style.backgroundColor = '#d64f24';
                      }
                    }}
                  >
                    {formStatus === 'loading' ? 'Sending...' : 'Send Message'}
                  </Button>
                </form>
              </div>

              {/* Quick Links - Collapsible with Enhanced Animations */}
              <div className="border-t border-white/20 pt-6">
                <button
                  onClick={() => toggleSection('quickLinks')}
                  className="flex items-center justify-between w-full text-left py-3 px-2 rounded-lg hover:bg-white/20 active:bg-gray-100/50 transition-all duration-200 min-h-[44px]"
                >
                  <h3 className="text-2xl font-bold" style={{ 
                    fontFamily: 'Comic Relief, sans-serif', 
                    color: '#013350' 
                  }}>
                    Quick Navigation
                  </h3>
                  <svg 
                    className={`w-6 h-6 transition-all duration-300 ${openSections.quickLinks ? 'rotate-45 scale-110' : 'rotate-0'}`}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </button>
                
                <div className={`transition-all duration-500 ease-out overflow-hidden ${
                  openSections.quickLinks 
                    ? 'max-h-96 opacity-100 mt-6 transform translate-y-0' 
                    : 'max-h-0 opacity-0 transform -translate-y-2'
                }`}>
                  <ul className="space-y-3 pl-2">
                    <li>
                      <button
                        onClick={() => scrollToSection('how-it-works')}
                        className="flex items-center text-gray-700 hover:text-blue-600 transition-all duration-200 group transform hover:translate-x-2"
                      >
                        <svg className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                        How It Works
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => scrollToSection('testimonials')}
                        className="flex items-center text-gray-700 hover:text-blue-600 transition-all duration-200 group transform hover:translate-x-2"
                      >
                        <svg className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                        Client Testimonials
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => scrollToSection('booking')}
                        className="flex items-center text-gray-700 hover:text-blue-600 transition-all duration-200 group transform hover:translate-x-2"
                      >
                        <svg className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                        Book Now
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => scrollToSection('about')}
                        className="flex items-center text-gray-700 hover:text-blue-600 transition-all duration-200 group transform hover:translate-x-2"
                      >
                        <svg className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                        About Me
                      </button>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Business Info - Collapsible with Enhanced Animations */}
              <div className="border-t border-white/20 pt-6">
                <button
                  onClick={() => toggleSection('businessInfo')}
                  className="flex items-center justify-between w-full text-left py-3 px-2 rounded-lg hover:bg-white/20 active:bg-gray-100/50 transition-all duration-200 min-h-[44px]"
                >
                  <h3 className="text-2xl font-bold" style={{ 
                    fontFamily: 'Comic Relief, sans-serif', 
                    color: '#013350' 
                  }}>
                    Business Information
                  </h3>
                  <svg 
                    className={`w-6 h-6 transition-all duration-300 ${openSections.businessInfo ? 'rotate-45 scale-110' : 'rotate-0'}`}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </button>
                
                <div className={`transition-all duration-500 ease-out overflow-hidden ${
                  openSections.businessInfo 
                    ? 'max-h-96 opacity-100 mt-6 transform translate-y-0' 
                    : 'max-h-0 opacity-0 transform -translate-y-2'
                }`}>
                  <div className="space-y-4 pl-2">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Business Hours</h4>
                      <p className="text-gray-600 text-sm">Monday - Saturday: 7:00 AM - 5:00 PM</p>
                      <p className="text-gray-600 text-sm">Sunday: Closed</p>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-gray-200 my-4"></div>
                    
                    <div className="flex items-center space-x-2">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      <span className="text-gray-700 text-sm">Fully Insured</span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <svg className="w-5 h-5 text-blue-600 hover:animate-pulse transition-all duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <span className="text-gray-700 text-sm">0451 494 922</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span className="text-gray-700 text-sm">manco.hakeem@gmail.com</span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <svg className="w-5 h-5 text-blue-600 hover:scale-110 transition-transform duration-200" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                      <span className="text-gray-700 text-sm">Northern Rivers Knife Sharpening</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="text-gray-700 text-sm">ABN: 61 217 603 910</span>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Service Areas</h4>
                      <p className="text-gray-600 text-sm">Postcodes: 2481, 2482, 2483, 2480, 2478, 2477, 2489</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Copyright */}
            <div className="border-t border-white/20 mt-12 pt-6 text-center">
              <p className="text-gray-600 text-sm">
                © 2024 Northern Rivers Knife Sharpening. All rights reserved.
              </p>
            </div>
          </div>
        </div>

        {/* Floating Back-to-Top Button */}
        {showBackToTop && (
          <button
            onClick={scrollToTop}
            className="fixed bottom-4 right-4 z-50 w-14 h-14 backdrop-blur-sm bg-white/30 border border-white/20 shadow-lg rounded-full flex items-center justify-center transform hover:scale-110 active:scale-95 transition-all duration-200"
            style={{ color: '#013350' }}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
          </button>
        )}
      </footer>
    </>
  )
}