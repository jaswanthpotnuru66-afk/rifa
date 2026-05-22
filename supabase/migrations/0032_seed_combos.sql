INSERT INTO public.combos (tier, title, subtitle, price, tag, img_idx, dark_mode, includes)
VALUES 
(
    '01', 
    'Student Friendly', 
    'The Thoughtful Starter', 
    '₹500', 
    'Great for Students', 
    2, 
    false, 
    '["Handcrafted Keychain", "Mini Resin Frame", "Complimentary gift wrap", "Personalised note card"]'::jsonb
),
(
    '02', 
    'Standard Love', 
    'The Signature Set', 
    '₹1,000', 
    'Most Popular', 
    10, 
    true, 
    '["Handcrafted Bouquet", "Resin Photo Frame", "Premium Chocolate", "Complimentary gift wrap", "Personalised note card"]'::jsonb
),
(
    '03', 
    'Premium Hamper', 
    'The Statement Gift', 
    '₹1,500+', 
    'Best Value', 
    18, 
    false, 
    '["Large Handcrafted Bouquet", "Custom Resin Clock", "Curated Gift Box", "Surprise Add-ons", "Complimentary gift wrap", "Personalised note card"]'::jsonb
);
