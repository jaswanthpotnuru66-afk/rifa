-- Create Disputes Table
CREATE TABLE IF NOT EXISTS disputes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id),
    artisan_id TEXT REFERENCES artisans(id),
    buyer_id UUID REFERENCES users(id),
    category TEXT NOT NULL, -- e.g., 'damaged', 'delayed', 'mismatch', 'other'
    description TEXT,
    evidence_urls TEXT[],
    status TEXT DEFAULT 'open', -- 'open', 'under-review', 'resolved', 'closed'
    verdict TEXT, -- 'refunded', 'rejected', 'partially-refunded'
    admin_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Payouts Table
CREATE TABLE IF NOT EXISTS payouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    artisan_id TEXT REFERENCES artisans(id),
    order_ids UUID[], -- Array of order IDs included in this payout
    gross_amount NUMERIC(12,2) NOT NULL,
    commission_amount NUMERIC(12,2) NOT NULL,
    tcs_amount NUMERIC(12,2) NOT NULL,
    shipping_adjustment NUMERIC(12,2) DEFAULT 0,
    net_amount NUMERIC(12,2) NOT NULL,
    status TEXT DEFAULT 'pending', -- 'pending', 'released', 'held'
    admin_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    released_at TIMESTAMPTZ
);

-- Add updated_at trigger for disputes
CREATE OR REPLACE FUNCTION update_disputes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_disputes_timestamp
    BEFORE UPDATE ON disputes
    FOR EACH ROW
    EXECUTE FUNCTION update_disputes_updated_at();
