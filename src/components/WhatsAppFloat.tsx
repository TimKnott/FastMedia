import { MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const WhatsAppFloat = () => (
  <motion.a
    href="https://wa.me/4407926400060"
    target="_blank"
    rel="noopener noreferrer"
    aria-label="Chat on WhatsApp"
    initial={{ scale: 0, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    transition={{ delay: 1.5, type: 'spring', stiffness: 200 }}
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.95 }}
    className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-[#25D366] text-white shadow-lg hover:shadow-xl flex items-center justify-center transition-shadow"
  >
    <MessageCircle className="w-7 h-7" />
  </motion.a>
);

export default WhatsAppFloat;
