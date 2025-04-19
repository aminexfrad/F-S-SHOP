"use client";

import styles from "../styles/about.module.css";
import Image from "next/image";
import Navbar from '../components/navbar/page';

export default function AboutPage() {

    return (
        <>
        <Navbar/>
        <div className={styles.container}>
            <section className={styles.aboutSection}>
                <h2 className={styles.sectionTitle}>Our Story</h2>
                <p className={styles.sectionDescription}>
                    ShopifyFR was founded with a simple idea — to create stylish and comfortable clothing for everyone. 
                    We believe fashion should not only look good but also feel great. 
                    Our journey began with a passion for quality and attention to detail, and we have never looked back.
                </p>
                <div className={styles.aboutContent}>
                    <Image
                        src="/images/Aboutus.jpg"
                        alt="Our Team"
                        className={styles.image}
                        width={300} height={300}
                    />
                    <div className={styles.text}>
                        <p>
                            Our products are designed with high-quality materials, ensuring durability and comfort.
                            We stay ahead of trends, blending modern aesthetics with timeless designs.
                        </p>
                        <p>
                            Sustainability is at the core of our business. We source eco-friendly materials and 
                            partner with ethical manufacturers to minimize our environmental impact.
                        </p>
                    </div>
                </div>
            </section>

            {/* Why Choose Us */}
            <section className={styles.whyChooseSection}>
                <h2 className={styles.sectionTitle}>Why Choose Us?</h2>
                <div className={styles.cards}>
                    <div className={styles.card}>
                        <h3>🌍 Sustainable</h3>
                        <p>
                            We use eco-friendly fabrics and follow ethical manufacturing practices.
                        </p>
                    </div>
                    <div className={styles.card}>
                        <h3>👗 High Quality</h3>
                        <p>
                            Our clothes are made from premium materials for lasting comfort and style.
                        </p>
                    </div>
                    <div className={styles.card}>
                        <h3>🚚 Fast Shipping</h3>
                        <p>
                            We offer quick and reliable delivery to ensure customer satisfaction.
                        </p>
                    </div>
                    <div className={styles.card}>
                        <h3>❤️ Customer Support</h3>
                        <p>
                            Our support team is available 24/7 to help with any questions or issues.
                        </p>
                    </div>
                </div>
            </section>
        </div>
        </>
    );
}
