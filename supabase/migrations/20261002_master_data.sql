-- Create Fabric Materials Table
CREATE TABLE IF NOT EXISTS public.fabric_materials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create Color Shades Table
CREATE TABLE IF NOT EXISTS public.color_shades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    hex_code TEXT,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create Occasions Table
CREATE TABLE IF NOT EXISTS public.occasions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Alter Products Table to add foreign keys
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS fabric_material_id UUID REFERENCES public.fabric_materials(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS color_shade_id UUID REFERENCES public.color_shades(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS occasion_id UUID REFERENCES public.occasions(id) ON DELETE SET NULL;

-- Enable RLS
ALTER TABLE public.fabric_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.color_shades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.occasions ENABLE ROW LEVEL SECURITY;

-- Create Policies (Public Read, Admin Write)
CREATE POLICY "Allow public read access on fabric_materials" ON public.fabric_materials FOR SELECT USING (true);
CREATE POLICY "Allow all access on fabric_materials for anon/admin" ON public.fabric_materials FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow public read access on color_shades" ON public.color_shades FOR SELECT USING (true);
CREATE POLICY "Allow all access on color_shades for anon/admin" ON public.color_shades FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow public read access on occasions" ON public.occasions FOR SELECT USING (true);
CREATE POLICY "Allow all access on occasions for anon/admin" ON public.occasions FOR ALL USING (true) WITH CHECK (true);

-- Insert Default Color Shades
INSERT INTO public.color_shades (name, slug, hex_code, sort_order) VALUES
('Royal Magenta', 'royal-magenta', '#B21E5B', 1),
('Midnight Blue', 'midnight-blue', '#102A43', 2),
('Burgundy Wine', 'burgundy-wine', '#5F1728', 3),
('Deep Maroon', 'deep-maroon', '#6B1026', 4),
('Golden Yellow', 'golden-yellow', '#D4AF37', 5),
('Terracotta', 'terracotta', '#E2725B', 6),
('Pastel Pink', 'pastel-pink', '#FFD1DC', 7),
('Sage Green', 'sage-green', '#9DC183', 8),
('Emerald Green', 'emerald-green', '#50C878', 9),
('Peacock Blue', 'peacock-blue', '#005f69', 10),
('Blush Peach', 'blush-peach', '#FFCBA4', 11),
('Mustard Gold', 'mustard-gold', '#FFDB58', 12),
('Crimson Red', 'crimson-red', '#990000', 13),
('Royal Navy', 'royal-navy', '#000080', 14),
('Ivory Cream', 'ivory-cream', '#FFFFF0', 15),
('Charcoal Obsidian', 'charcoal-obsidian', '#36454F', 16)
ON CONFLICT (slug) DO NOTHING;

-- Insert Default Occasions
INSERT INTO public.occasions (name, slug, sort_order) VALUES
('Wedding', 'wedding', 1),
('Bridal', 'bridal', 2),
('Festive Luxe', 'festive-luxe', 3),
('Party Wear', 'party-wear', 4),
('Office', 'office', 5),
('Casual', 'casual', 6)
ON CONFLICT (slug) DO NOTHING;

-- Insert Default Fabric Materials (Assuming some based on standard saree fabrics)
INSERT INTO public.fabric_materials (name, slug, sort_order) VALUES
('Kanjivaram Silk', 'kanjivaram-silk', 1),
('Banarasi Silk', 'banarasi-silk', 2),
('Chiffon', 'chiffon', 3),
('Georgette', 'georgette', 4),
('Cotton Silk', 'cotton-silk', 5),
('Organza', 'organza', 6),
('Linen', 'linen', 7)
ON CONFLICT (slug) DO NOTHING;

-- Migrate existing product data to reference master data IDs
DO $$
DECLARE
    rec RECORD;
    v_fabric_id UUID;
    v_color_id UUID;
    v_occasion_id UUID;
BEGIN
    FOR rec IN SELECT id, fabric, color, occasion FROM public.products LOOP
        -- Match Fabric
        IF rec.fabric IS NOT NULL THEN
            SELECT id INTO v_fabric_id FROM public.fabric_materials WHERE name ILIKE rec.fabric LIMIT 1;
            IF v_fabric_id IS NULL THEN
                INSERT INTO public.fabric_materials (name, slug) VALUES (rec.fabric, LOWER(REPLACE(rec.fabric, ' ', '-'))) RETURNING id INTO v_fabric_id;
            END IF;
        ELSE
            v_fabric_id := NULL;
        END IF;

        -- Match Color
        IF rec.color IS NOT NULL THEN
            SELECT id INTO v_color_id FROM public.color_shades WHERE name ILIKE rec.color LIMIT 1;
            IF v_color_id IS NULL THEN
                INSERT INTO public.color_shades (name, slug) VALUES (rec.color, LOWER(REPLACE(rec.color, ' ', '-'))) RETURNING id INTO v_color_id;
            END IF;
        ELSE
            v_color_id := NULL;
        END IF;

        -- Match Occasion
        IF rec.occasion IS NOT NULL THEN
            SELECT id INTO v_occasion_id FROM public.occasions WHERE name ILIKE rec.occasion LIMIT 1;
            IF v_occasion_id IS NULL THEN
                INSERT INTO public.occasions (name, slug) VALUES (rec.occasion, LOWER(REPLACE(rec.occasion, ' ', '-'))) RETURNING id INTO v_occasion_id;
            END IF;
        ELSE
            v_occasion_id := NULL;
        END IF;

        -- Update product
        UPDATE public.products SET 
            fabric_material_id = v_fabric_id,
            color_shade_id = v_color_id,
            occasion_id = v_occasion_id
        WHERE id = rec.id;
    END LOOP;
END $$;
