-- Create Shipping Alerts Table
CREATE TABLE IF NOT EXISTS shipping_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id),
    artisan_id TEXT REFERENCES artisans(id),
    type TEXT NOT NULL, -- 'weight_mismatch', 'delay', 'lost_package', 'damaged_in_transit'
    severity TEXT DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
    description TEXT,
    original_weight NUMERIC(10,3), -- For weight mismatches
    detected_weight NUMERIC(10,3), -- For weight mismatches
    adjustment_amount NUMERIC(12,2) DEFAULT 0,
    status TEXT DEFAULT 'pending', -- 'pending', 'resolved', 'disputed', 'accepted'
    resolved_at TIMESTAMPTZ,
    admin_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add updated_at trigger for shipping_alerts
CREATE TRIGGER update_shipping_alerts_timestamp
    BEFORE UPDATE ON shipping_alerts
    FOR EACH ROW
    EXECUTE FUNCTION update_disputes_updated_at();
