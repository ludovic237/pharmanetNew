export interface ForecastPoint { date: string; yhat: number; }

export interface ForecastResponse {
  produit_id: number;
  horizon_days: number;
  history_days: number;
  forecast: ForecastPoint[];
}

export interface LowStockItem {
  produit_id: number;
  produit: string;
  stock: number;
  threshold: number;
}

export interface ReplenishmentResponse {
  produit_id: number;
  current_stock: number;
  safety_stock: number;
  reorder_point: number;
  suggested_order_qty: number;
  rationale: string;
}

export interface RecommendationItem {
  produit_id: number;
  produit: string;
  score: number;
}

export interface OptimizeDashboardResponse {
  best_sellers: RecommendationItem[];
  low_stock: LowStockItem[];
  reorder_suggestions: Array<{
    produit_id: number;
    current_stock: number;
    safety_stock: number;
    reorder_point: number;
    suggested_order_qty: number;
    rationale: string;
  }>;
}
