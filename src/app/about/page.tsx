import { Shield, Heart, Star } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">About Lokus</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Redefining premium footwear with exceptional craftsmanship, innovative design, and uncompromising quality.
        </p>
      </div>

      {/* Mission Section */}
      <div className="mb-16">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <Heart className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Our Mission</h2>
        </div>
        <div className="prose prose-lg max-w-none text-gray-600">
          <p className="text-center">
            At Lokus, we believe that exceptional footwear should be accessible to everyone who values quality and style. 
            Our mission is to craft premium shoes that blend traditional craftsmanship with modern innovation, 
            creating footwear that not only looks exceptional but feels extraordinary with every step.
          </p>
        </div>
      </div>

      {/* Values Section */}
      <div className="mb-16">
        <h2 className="text-2xl font-semibold text-gray-900 text-center mb-12">Our Values</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-4">
              <Shield className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Quality First</h3>
            <p className="text-gray-600">
              Every pair undergoes rigorous quality checks to ensure it meets our exacting standards for durability, comfort, and style.
            </p>
          </div>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mb-4">
              <Star className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Craftsmanship</h3>
            <p className="text-gray-600">
              We combine traditional shoemaking techniques with modern technology to create footwear that stands the test of time.
            </p>
          </div>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-orange-100 rounded-full mb-4">
              <Heart className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Customer Focus</h3>
            <p className="text-gray-600">
              Your satisfaction is our priority. We're committed to providing exceptional service and standing behind every product we sell.
            </p>
          </div>
        </div>
      </div>

      {/* Story Section */}
      <div className="mb-16">
        <h2 className="text-2xl font-semibold text-gray-900 text-center mb-8">Our Story</h2>
        <div className="prose prose-lg max-w-none text-gray-600 space-y-4">
          <p>
            Founded with a simple yet powerful vision – to create footwear that transcends mere function and becomes an expression of personal style – 
            Lokus has grown from a passionate idea into a trusted name in premium footwear.
          </p>
          <p>
            Our journey began when our founders, frustrated with the compromise between quality and affordability in the footwear market, 
            decided to take matters into their own hands. They assembled a team of skilled artisans, designers, and footwear enthusiasts 
            who shared their commitment to excellence.
          </p>
          <p>
            Today, Lokus stands as a testament to what's possible when passion meets precision. Every shoe we create tells a story of dedication, 
            innovation, and an unwavering commitment to our customers' satisfaction.
          </p>
        </div>
      </div>

      {/* Commitment Section */}
      <div className="bg-gray-50 rounded-2xl p-8 text-center">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Our Commitment</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          We're committed to sustainable practices, ethical sourcing, and creating footwear that not only looks good but does good. 
          From our eco-friendly packaging to our fair-trade partnerships, every decision we make is guided by our responsibility to our customers, our community, and our planet.
        </p>
      </div>
    </div>
  );
}
