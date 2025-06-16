"use client";

import { motion } from "framer-motion";

export default function Loading() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="flex flex-col items-center space-y-8">
                {/* Logo ou titre animé */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="text-center"
                >
                </motion.div>
                <div className="flex space-x-2">
                    {[0, 1, 2].map((index) => (
                        <motion.div
                            key={index}
                            className="w-3 h-3 bg-blue-500 rounded-full"
                            animate={{
                                y: [0, -10, 0],
                                opacity: [0.5, 1, 0.5]
                            }}
                            transition={{
                                duration: 0.8,
                                repeat: Infinity,
                                delay: index * 0.2,
                                ease: "easeInOut"
                            }}
                        />
                    ))}
                </div>
                <p className="text-gray-600">Chargement en cours...</p>
            </div>
        </div>
    );
} 