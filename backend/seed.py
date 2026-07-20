from sqlmodel import Session, select
from database import engine, init_db
import models

def seed_data():
    init_db()
    with Session(engine) as session:
        # Check if users already seeded
        if session.exec(select(models.User)).first():
            print("Database already seeded.")
            return

        print("Seeding database...")

        # 1. Create Users
        customer = models.User(
            name="Aarav Sharma",
            email="aarav@jharokha.in",
            role="customer",
            phone="+919876543210"
        )
        
        artisan_user1 = models.User(
            name="Riya Sen",
            email="riya@riyacrafts.in",
            role="artisan",
            phone="+919999888877"
        )
        
        artisan_user2 = models.User(
            name="Mohan Lal",
            email="mohan@potteryart.in",
            role="artisan",
            phone="+918888777766"
        )
        
        artisan_user3 = models.User(
            name="Kavitha Prasad",
            email="kavitha@banarasiweaves.in",
            role="artisan",
            phone="+917777666655"
        )

        session.add_all([customer, artisan_user1, artisan_user2, artisan_user3])
        session.commit()
        
        # Refresh to get IDs
        session.refresh(artisan_user1)
        session.refresh(artisan_user2)
        session.refresh(artisan_user3)

        # 2. Create Artisans
        artisan1 = models.Artisan(
            user_id=artisan_user1.id,
            bio="Riya Sen is a master basket weaver from Jaipur. She has spent over 15 years preserving the traditional bamboo and cane weaving techniques of Rajasthan. Each basket is hand-braided and uses organic, sustainably harvested fibers.",
            craft_type="Basketry & Bamboo Weaving",
            city="Jaipur",
            rating=4.8,
            photo_url="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80"
        )
        
        artisan2 = models.Artisan(
            user_id=artisan_user2.id,
            bio="Mohan Lal belongs to a family of fifth-generation potters from Khurja. He specializes in the famous Mughal-inspired Blue Pottery, which is completely handmade, glazed, and fired in traditional kilns.",
            craft_type="Blue Pottery & Ceramics",
            city="Khurja",
            rating=4.9,
            photo_url="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80"
        )
        
        artisan3 = models.Artisan(
            user_id=artisan_user3.id,
            bio="Kavitha Prasad is a national award-winning master weaver from the sacred city of Varanasi. She leads a small co-operative of women artisans spinning authentic silk and gold zari thread into heirloom Banarasi textiles.",
            craft_type="Handloom Silk Weaving",
            city="Varanasi",
            rating=5.0,
            photo_url="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80"
        )

        session.add_all([artisan1, artisan2, artisan3])
        session.commit()
        
        session.refresh(artisan1)
        session.refresh(artisan2)
        session.refresh(artisan3)

        # 3. Create Categories
        cat_textiles = models.Category(name="Heritage Textiles", slug="textiles", jharokha_style="arched-jharokha")
        cat_pottery = models.Category(name="Khurja Pottery", slug="pottery", jharokha_style="round-jharokha")
        cat_woodwork = models.Category(name="Bamboo & Woodwork", slug="woodwork", jharokha_style="default-jharokha")
        cat_metal = models.Category(name="Metal Crafts", slug="metal", jharokha_style="default-jharokha")

        session.add_all([cat_textiles, cat_pottery, cat_woodwork, cat_metal])
        session.commit()
        
        session.refresh(cat_textiles)
        session.refresh(cat_pottery)
        session.refresh(cat_woodwork)
        session.refresh(cat_metal)

        # 4. Create Products and Customization Options
        
        # Product 1: Bamboo Basket
        prod1 = models.Product(
            artisan_id=artisan1.id,
            category_id=cat_woodwork.id,
            title="Handwoven Bamboo Storage Basket",
            description="Our signature basket is handwoven from wild bamboo splits, showcasing natural brown and golden tones. It features a sturdy construction perfect for logs, blankets, toys, or as a decorative planter sleeve.",
            base_price=899.0,
            is_customizable=True,
            stock_qty=15,
            images=[
                "https://images.unsplash.com/photo-1590736969955-71cc94801759?w=600&auto=format&fit=crop&q=80",
                "https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=600&auto=format&fit=crop&q=80"
            ],
            status="active"
        )
        session.add(prod1)
        session.commit()
        session.refresh(prod1)
        
        opt1_1 = models.CustomizationOption(
            product_id=prod1.id,
            option_name="Lining Fabric & Color",
            option_type="color_swatch",
            choices=[
                {"name": "No Lining / Natural Cane", "price": 0.0, "color": "#E6C280"},
                {"name": "Indigo Khadi Cotton Lining", "price": 120.0, "color": "#1A2B4C"},
                {"name": "Terracotta Linen Lining", "price": 150.0, "color": "#C26D4C"},
                {"name": "Mustard Yellow Canvas Lining", "price": 150.0, "color": "#E5A93C"}
            ]
        )
        opt1_2 = models.CustomizationOption(
            product_id=prod1.id,
            option_name="Handle Style",
            option_type="select",
            choices=[
                {"name": "Classic Integrated Handles", "price": 0.0},
                {"name": "Full Grain Leather Wrap Handles", "price": 200.0},
                {"name": "Double-Braided Rope Handles", "price": 150.0}
            ]
        )
        opt1_3 = models.CustomizationOption(
            product_id=prod1.id,
            option_name="Personalized Bamboo Tag",
            option_type="text",
            choices={
                "placeholder": "Enter name or initials (Max 12 chars)",
                "max_len": 12,
                "price": 100.0
            }
        )
        session.add_all([opt1_1, opt1_2, opt1_3])
        
        # Product 2: Khurja Vase
        prod2 = models.Product(
            artisan_id=artisan2.id,
            category_id=cat_pottery.id,
            title="Khurja Mughal Cobalt Ceramic Vase",
            description="Adorned with traditional hand-painted floral motifs in vibrant cobalt blue, turquoise, and mustard, this earthenware vase is glazed to a high gloss. Represents centuries-old Mughal design aesthetics.",
            base_price=1249.0,
            is_customizable=True,
            stock_qty=8,
            images=[
                "https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?w=600&auto=format&fit=crop&q=80",
                "https://images.unsplash.com/photo-1578500494198-246f612d3b3d?w=600&auto=format&fit=crop&q=80"
            ],
            status="active"
        )
        session.add(prod2)
        session.commit()
        session.refresh(prod2)
        
        opt2_1 = models.CustomizationOption(
            product_id=prod2.id,
            option_name="Vase Base Pattern",
            option_type="select",
            choices=[
                {"name": "Mughal Floral Vine (Classic)", "price": 0.0},
                {"name": "Geometrical Jaali Pattern", "price": 150.0},
                {"name": "Royal Peacock Medallion", "price": 300.0}
            ]
        )
        opt2_2 = models.CustomizationOption(
            product_id=prod2.id,
            option_name="Accent Glaze Color",
            option_type="color_swatch",
            choices=[
                {"name": "Classic Cobalt Blue", "price": 0.0, "color": "#002fa7"},
                {"name": "Turquoise Green", "price": 0.0, "color": "#30d5c8"},
                {"name": "Royal Saffron Ochre", "price": 100.0, "color": "#f4c430"}
            ]
        )
        session.add_all([opt2_1, opt2_2])

        # Product 3: Banarasi Dupatta
        prod3 = models.Product(
            artisan_id=artisan3.id,
            category_id=cat_textiles.id,
            title="Handspun Katan Silk Banarasi Dupatta",
            description="Woven with pure Katan silk warp and weft, this dupatta is intricately decorated with gold (Sona) and silver (Rupa) zari work in a traditional shikargah design. Drapes beautifully and shimmers in changing light.",
            base_price=4500.0,
            is_customizable=True,
            stock_qty=5,
            images=[
                "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&auto=format&fit=crop&q=80"
            ],
            status="active"
        )
        session.add(prod3)
        session.commit()
        session.refresh(prod3)

        opt3_1 = models.CustomizationOption(
            product_id=prod3.id,
            option_name="Zari Thread Combination",
            option_type="select",
            choices=[
                {"name": "Sona Zari (Pure Gold Thread)", "price": 0.0},
                {"name": "Rupa Zari (Pure Silver Thread)", "price": 200.0},
                {"name": "Sona-Rupa Ganga Jamuna Zari", "price": 500.0}
            ]
        )
        opt3_2 = models.CustomizationOption(
            product_id=prod3.id,
            option_name="Tassel Finishes",
            option_type="select",
            choices=[
                {"name": "Standard Knotted Fringes", "price": 0.0},
                {"name": "Heavy Silk Thread Tassels", "price": 250.0},
                {"name": "Beaded Zari Tassels", "price": 400.0}
            ]
        )
        session.add_all([opt3_1, opt3_2])

        # Product 4: Brass Kettle (Not Customizable)
        prod4 = models.Product(
            artisan_id=artisan2.id,
            category_id=cat_metal.id,
            title="Hand-Engraved Brass Tea Kettle",
            description="Made from heavy-gauge pure brass, this tea kettle is completely hand-engraved with floral creepers and features an insulated wood-wrapped handle. Tin-lined inside (kalai) to be food safe.",
            base_price=2899.0,
            is_customizable=False,
            stock_qty=4,
            images=[
                "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600&auto=format&fit=crop&q=80"
            ],
            status="active"
        )
        session.add(prod4)
        
        # Product 5: Terracotta Diya Set (Not Customizable)
        prod5 = models.Product(
            artisan_id=artisan2.id,
            category_id=cat_pottery.id,
            title="Traditional Terracotta Diya Set (12 pcs)",
            description="Organic clay diyas handcrafted by local potters, baked in traditional wood fire. Perfect for festive decor, organic oil lamps.",
            base_price=199.0,
            is_customizable=False,
            stock_qty=50,
            images=[
                "https://images.unsplash.com/photo-1605884766416-d8d4bfd5fdf1?w=600&auto=format&fit=crop&q=80"
            ],
            status="active"
        )
        session.add(prod5)
        
        # Product 6: Wood Inlay Jewellery Box (Customizable)
        prod6 = models.Product(
            artisan_id=artisan1.id,
            category_id=cat_woodwork.id,
            title="Jaipur Rosewood Inlay Jewellery Box",
            description="Crafted from premium Sheesham wood (Indian Rosewood) and inlaid with delicate acrylic and brass wire motifs, this box features red velvet lining and a secret brass latch.",
            base_price=1650.0,
            is_customizable=True,
            stock_qty=6,
            images=[
                "https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?w=600&auto=format&fit=crop&q=80"
            ],
            status="active"
        )
        session.add(prod6)
        session.commit()
        session.refresh(prod6)

        opt6_1 = models.CustomizationOption(
            product_id=prod6.id,
            option_name="Inner Lining Velvet",
            option_type="color_swatch",
            choices=[
                {"name": "Royal Crimson Red", "price": 0.0, "color": "#800020"},
                {"name": "Emerald Green", "price": 0.0, "color": "#046307"},
                {"name": "Deep Royal Blue", "price": 50.0, "color": "#0b1075"}
            ]
        )
        opt6_2 = models.CustomizationOption(
            product_id=prod6.id,
            option_name="Engraved Monogram Brass Plate",
            option_type="text",
            choices={
                "placeholder": "Enter initials (e.g. R.S.)",
                "max_len": 4,
                "price": 180.0
            }
        )
        session.add_all([opt6_1, opt6_2])
        session.commit()

        # 5. Create Reviews
        rev1 = models.Review(product_id=prod1.id, user_id=customer.id, rating=5, comment="Absolutely gorgeous! The lining color is rich, and the leather handles are extremely sturdy. A premium craft piece.")
        rev2 = models.Review(product_id=prod1.id, user_id=customer.id, rating=4, comment="Very beautiful basket, and the custom tag adds a really nice personal touch. Took a couple of days extra to weave, but worth it.")
        rev3 = models.Review(product_id=prod2.id, user_id=customer.id, rating=5, comment="Stunning glaze, standard Khurja excellence. It sits as a centerpiece in our living room. Package was safely packed.")
        
        session.add_all([rev1, rev2, rev3])
        session.commit()
        
        print("Database seeded successfully!")

if __name__ == "__main__":
    seed_data()
