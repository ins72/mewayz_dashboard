import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import { ArrowRight, Check, Star, Users, TrendingUp, Shield, Zap } from 'lucide-react';

const LandingPage = () => {
  const features = [
    {
      icon: <Users className="w-8 h-8 text-blue-500" />,
      title: "Social Media Management",
      description: "Manage all your social media accounts from one dashboard. Schedule posts, track engagement, and grow your audience across platforms.",
      modules: ["Post Scheduling", "Analytics Dashboard", "Multi-Platform Support", "Content Calendar"]
    },
    {
      icon: <TrendingUp className="w-8 h-8 text-green-500" />,
      title: "CRM & Sales",
      description: "Build stronger customer relationships with our powerful CRM tools. Track leads, manage deals, and boost your sales performance.",
      modules: ["Lead Management", "Sales Pipeline", "Customer Analytics", "Deal Tracking"]
    },
    {
      icon: <Shield className="w-8 h-8 text-purple-500" />,
      title: "E-commerce Suite",
      description: "Create and manage your online store with integrated inventory, orders, and payment processing capabilities.",
      modules: ["Product Management", "Order Processing", "Inventory Control", "Payment Integration"]
    },
    {
      icon: <Zap className="w-8 h-8 text-orange-500" />,
      title: "Link in Bio Builder",
      description: "Create stunning, customizable bio pages that convert visitors into customers with our drag-and-drop builder.",
      modules: ["Custom Templates", "Click Analytics", "Mobile Optimized", "Social Integration"]
    }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Marketing Director",
      company: "TechStart Inc.",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b5fc121d?w=150&h=150&fit=crop&crop=face",
      content: "Mewayz transformed our social media strategy. We've seen a 300% increase in engagement and our workflow is now smooth and efficient."
    },
    {
      name: "Michael Chen",
      role: "E-commerce Manager",
      company: "Digital Dynamics",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      content: "The CRM integration is game-changing. We've streamlined our sales process and increased conversion rates by 45%."
    },
    {
      name: "Emily Rodriguez",
      role: "Content Creator",
      company: "Creative Studio",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
      content: "Finally, a platform that understands creators. The Link in Bio builder helped me increase my conversion rate by 200%."
    }
  ];

  const pricingPlans = [
    {
      name: "Basic",
      price: "$30",
      period: "per month",
      description: "Perfect for small teams and growing businesses",
      features: [
        "5 Social Media Accounts",
        "Basic CRM Features",
        "Link in Bio Builder",
        "Email Support",
        "Basic Analytics"
      ],
      popular: false,
      color: "border-gray-200"
    },
    {
      name: "Professional",
      price: "$100",
      period: "per month",
      description: "Advanced features for scaling businesses",
      features: [
        "15 Social Media Accounts",
        "Advanced CRM & Sales Tools",
        "E-commerce Integration",
        "Priority Support",
        "Advanced Analytics",
        "Custom Integrations"
      ],
      popular: true,
      color: "border-blue-500 ring-2 ring-blue-500"
    },
    {
      name: "Enterprise",
      price: "$300",
      period: "per month",
      description: "Complete solution for large organizations",
      features: [
        "Unlimited Social Media Accounts",
        "Full CRM Suite",
        "Advanced E-commerce",
        "24/7 Priority Support",
        "Custom Analytics",
        "API Access",
        "White-label Options"
      ],
      popular: false,
      color: "border-gray-200"
    }
  ];

  const stats = [
    { number: "50K+", label: "Active Users" },
    { number: "2M+", label: "Posts Scheduled" },
    { number: "99.9%", label: "Uptime" },
    { number: "24/7", label: "Support" }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-foreground">Mewayz</span>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/login-screen">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link to="/registration-screen">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
            Grow Your Business with
            <span className="text-blue-500"> All-in-One</span> Platform
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Manage social media, CRM, e-commerce, and more from one powerful dashboard. 
            Streamline your workflow and boost your business growth with Mewayz.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link to="/registration-screen">
              <Button size="lg" className="min-w-[200px]">
                Start Free Trial
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="min-w-[200px]">
              Watch Demo
            </Button>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl font-bold text-blue-500 mb-2">{stat.number}</div>
                <div className="text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Powerful tools designed to help you manage, grow, and scale your business 
              across all digital channels.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="p-8 border border-border rounded-lg hover:shadow-lg transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="text-2xl font-semibold text-foreground mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      {feature.description}
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {feature.modules.map((module, moduleIndex) => (
                        <div key={moduleIndex} className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-green-500" />
                          <span className="text-sm text-muted-foreground">{module}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 bg-muted/20">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Trusted by Thousands of Businesses
            </h2>
            <p className="text-xl text-muted-foreground">
              See how Mewayz is helping businesses grow and succeed
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="p-6 bg-background border border-border rounded-lg">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-6 italic">
                  "{testimonial.content}"
                </p>
                <div className="flex items-center gap-3">
                  <img 
                    src={testimonial.avatar} 
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <div className="font-semibold text-foreground">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {testimonial.role} • {testimonial.company}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-muted-foreground">
              Choose the plan that fits your business needs
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <div key={index} className={`p-8 border rounded-lg relative ${plan.color} ${plan.popular ? 'bg-blue-50/50 dark:bg-blue-950/20' : 'bg-background'}`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-foreground mb-2">{plan.name}</h3>
                  <div className="text-4xl font-bold text-foreground mb-2">
                    {plan.price}
                    <span className="text-lg font-normal text-muted-foreground">/{plan.period}</span>
                  </div>
                  <p className="text-muted-foreground">{plan.description}</p>
                </div>
                
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center gap-2">
                      <Check className="w-5 h-5 text-green-500" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Link to="/registration-screen">
                  <Button 
                    className="w-full" 
                    variant={plan.popular ? "default" : "outline"}
                  >
                    Get Started
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-500 to-purple-600">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Transform Your Business?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of businesses already growing with Mewayz. 
            Start your free trial today and experience the difference.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/registration-screen">
              <Button size="lg" variant="secondary" className="min-w-[200px]">
                Start Free Trial
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="min-w-[200px] border-white text-white hover:bg-white hover:text-blue-500">
              Contact Sales
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-background border-t border-border">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-foreground">Mewayz</span>
              </div>
              <p className="text-muted-foreground">
                The all-in-one platform for modern businesses to manage, grow, and scale.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-foreground mb-4">Product</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-muted-foreground hover:text-foreground">Features</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground">Pricing</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground">Integrations</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground">API</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-foreground mb-4">Company</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-muted-foreground hover:text-foreground">About</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground">Blog</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground">Careers</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-foreground mb-4">Support</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-muted-foreground hover:text-foreground">Help Center</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground">Community</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground">Status</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground">Security</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-border mt-8 pt-8 text-center">
            <p className="text-muted-foreground">
              © 2025 Mewayz. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;