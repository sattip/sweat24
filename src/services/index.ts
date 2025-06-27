// API Services
export { apiService } from './api';
export { authService } from './authService';
export { trainersService } from './trainersService';
export { classesService } from './classesService';
export { packagesService } from './packagesService';
export { dashboardService } from './dashboardService';
export { productsService } from './productsService';

// Types
export type { User, LoginRequest, RegisterRequest, AuthResponse } from './authService';
export type { Trainer, Service, TrainerFilters } from './trainersService';
export type { GymClass, Booking, CreateBookingRequest, ClassFilters } from './classesService';
export type { Package, UserPackage, PurchasePackageRequest } from './packagesService';
export type { DashboardStats, BirthdayReward } from './dashboardService';
export type { Product, CartItem, Order, OrderItem, ProductFilters } from './productsService';

// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8001/api/v1';