import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import ApperIcon from "@/components/ApperIcon";
import hotelService from "@/services/api/hotelService";

const HotelDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(2);

  const loadHotel = async () => {
    try {
      setError(null);
      setLoading(true);
      const data = await hotelService.getById(id);
      setHotel(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHotel();
  }, [id]);

  const handleBookNow = () => {
    if (!checkIn || !checkOut) {
      alert("Please select check-in and check-out dates");
      return;
    }
    
    const bookingData = {
      hotelId: hotel.Id,
      checkIn,
      checkOut,
      guests
    };
    
    // Navigate to booking flow with data
    navigate("/booking", { state: { hotel, bookingData } });
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <ApperIcon 
        key={i} 
        name="Star" 
        className={`w-5 h-5 ${i < rating ? 'text-amber-400 fill-current' : 'text-gray-300'}`} 
      />
    ));
  };

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadHotel} />;
  if (!hotel) return <Error message="Hotel not found" />;

  return (
    <div className="min-h-screen bg-background">
      {/* Image Gallery */}
      <div className="relative h-96 md:h-[500px] overflow-hidden">
        <img
          src={hotel.images[selectedImageIndex]}
          alt={hotel.name}
          className="w-full h-full object-cover cursor-pointer"
          onClick={() => setIsGalleryOpen(true)}
        />
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        
        <div className="absolute top-4 left-4">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ApperIcon name="ArrowLeft" className="w-5 h-5 mr-2" />
            Back
          </Button>
        </div>

        <div className="absolute top-4 right-4 flex gap-2">
          {!hotel.available && <Badge variant="error">Unavailable</Badge>}
          {hotel.featured && <Badge variant="accent">Featured</Badge>}
        </div>

        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {hotel.images.map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedImageIndex(index)}
                className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                  selectedImageIndex === index ? 'border-accent-500' : 'border-white/50'
                }`}
              >
                <img src={image} alt={`View ${index + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Hotel Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-2">
                    {hotel.name}
                  </h1>
                  <div className="flex items-center text-gray-600 mb-4">
                    <ApperIcon name="MapPin" className="w-5 h-5 mr-2" />
                    <span>{hotel.address}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-primary-500">
                    ${hotel.pricePerNight}
                  </div>
                  <div className="text-sm text-gray-500">per night</div>
                </div>
              </div>

              <div className="flex items-center space-x-6">
                <div className="flex items-center">
                  {renderStars(hotel.starRating)}
                  <span className="ml-2 text-sm text-gray-600">{hotel.starRating} Star Hotel</span>
                </div>
                <div className="flex items-center bg-primary-50 rounded-lg px-3 py-2">
                  <ApperIcon name="Star" className="w-4 h-4 text-amber-400 fill-current mr-1" />
                  <span className="font-medium text-primary-700">{hotel.rating}</span>
                  <span className="text-sm text-gray-600 ml-2">({hotel.reviewCount} reviews)</span>
                </div>
              </div>
            </motion.div>

            {/* Description */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="card p-6"
            >
              <h2 className="text-2xl font-display font-semibold text-gray-900 mb-4">About This Hotel</h2>
              <p className="text-gray-700 leading-relaxed">{hotel.description}</p>
            </motion.div>

            {/* Amenities */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="card p-6"
            >
              <h2 className="text-2xl font-display font-semibold text-gray-900 mb-6">Amenities & Services</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {hotel.amenities.map((amenity, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-primary-50 rounded-lg flex items-center justify-center">
                      <ApperIcon name="Check" className="w-4 h-4 text-primary-500" />
                    </div>
                    <span className="text-gray-700">{amenity}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Location */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="card p-6"
            >
              <h2 className="text-2xl font-display font-semibold text-gray-900 mb-4">Location</h2>
              <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center">
                <div className="text-center text-gray-600">
                  <ApperIcon name="MapPin" className="w-8 h-8 mx-auto mb-2" />
                  <p>{hotel.location.city}, {hotel.location.state}</p>
                  <p className="text-sm">{hotel.address}</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="card p-6 sticky top-24"
            >
              <h3 className="text-xl font-display font-semibold text-gray-900 mb-6">Book Your Stay</h3>
              
              <div className="space-y-4 mb-6">
                <div>
                  <label className="label">Check-in Date</label>
                  <input
                    type="date"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    min={format(new Date(), "yyyy-MM-dd")}
                    className="input"
                  />
                </div>
                
                <div>
                  <label className="label">Check-out Date</label>
                  <input
                    type="date"
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    min={checkIn || format(new Date(), "yyyy-MM-dd")}
                    className="input"
                  />
                </div>
                
                <div>
                  <label className="label">Guests</label>
                  <select 
                    value={guests} 
                    onChange={(e) => setGuests(parseInt(e.target.value))}
                    className="input"
                  >
                    {[1,2,3,4,5,6,7,8].map(num => (
                      <option key={num} value={num}>
                        {num} {num === 1 ? 'Guest' : 'Guests'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {checkIn && checkOut && (
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">Rate per night</span>
                    <span className="font-medium">${hotel.pricePerNight}</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">Nights</span>
                    <span className="font-medium">
                      {Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24))}
                    </span>
                  </div>
                  <div className="border-t border-gray-200 pt-2 mt-2">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-gray-900">Total</span>
                      <span className="text-xl font-bold text-primary-500">
                        ${hotel.pricePerNight * Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24))}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <Button
                onClick={handleBookNow}
                className="w-full"
                disabled={!hotel.available}
                size="lg"
              >
                {hotel.available ? (
                  <>
                    <ApperIcon name="Calendar" className="w-5 h-5 mr-2" />
                    Book Now
                  </>
                ) : (
                  "Unavailable"
                )}
              </Button>

              {hotel.available && (
                <p className="text-sm text-gray-500 text-center mt-4">
                  Free cancellation • No booking fees
                </p>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Image Gallery Modal */}
      <AnimatePresence>
        {isGalleryOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
            onClick={() => setIsGalleryOpen(false)}
          >
            <div className="relative max-w-6xl max-h-full" onClick={e => e.stopPropagation()}>
              <img
                src={hotel.images[selectedImageIndex]}
                alt={`${hotel.name} - Image ${selectedImageIndex + 1}`}
                className="max-w-full max-h-full object-contain"
              />
              
              <Button
                variant="ghost"
                className="absolute top-4 right-4 text-white hover:bg-white/10"
                onClick={() => setIsGalleryOpen(false)}
              >
                <ApperIcon name="X" className="w-6 h-6" />
              </Button>
              
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                {hotel.images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`w-3 h-3 rounded-full transition-colors ${
                      selectedImageIndex === index ? 'bg-accent-500' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HotelDetailsPage;