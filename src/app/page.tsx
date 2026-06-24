// src/app/page.tsx
"use client";

import Link from "next/link";
import {
  FaRecycle,
  FaMapMarkedAlt,
  FaLeaf,
  FaQuestionCircle,
  FaEnvelope,
  FaBolt,
  FaMinus,
  FaPlus,
  FaArrowRight,
  FaPhone,
} from "react-icons/fa";
import styles from "./landing-page.module.css"; // Import module CSS
import React, { useState } from "react";

export default function LandingPage() {
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);
  const [stats, setStats] = useState({ userCount: 0, completedListings: 0, totalWasteRecycled: 0 });
  const fullHeroTitle = "Revolutionizing Waste Management for a Cleaner India"; // Define your hero title here

  React.useEffect(() => {
    fetch('/api/stats')
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(err => console.error(err));
  }, []);

  const toggleFAQ = (index: number) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  return (
    <div className={styles.landingPageContainer}>
      {/* Hero Section */}
      <section
        className={styles.heroSection}
      >
        <div className={styles.heroOverlay}></div>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>
            {fullHeroTitle}
          </h1>
          <p className={styles.heroSubtitle}>
            Connect waste generators with collectors for efficient, sustainable
            waste disposal.
          </p>
          <Link href="/auth/signup" className={styles.getStartedButton}>
            <FaBolt className={styles.buttonIcon} /> Get Started Today
          </Link>
        </div>
      </section>

      {/* Platform Impact Section */}
      <section className={styles.impactSection}>
        <div className={styles.container}>
          <div className={styles.impactGrid}>
            <div className={styles.impactCard}>
              <h3 className={styles.impactNumber}>{stats.userCount}+</h3>
              <p className={styles.impactLabel}>Active Users</p>
            </div>
            <div className={styles.impactCard}>
              <h3 className={styles.impactNumber}>{stats.completedListings}+</h3>
              <p className={styles.impactLabel}>Successful Pickups</p>
            </div>
            <div className={styles.impactCard}>
              <h3 className={styles.impactNumber}>{stats.totalWasteRecycled} kg</h3>
              <p className={styles.impactLabel}>Waste Recycled</p>
            </div>
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section className={styles.aboutUsSection}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>What is Smart Waste Swaraj?</h2>
          <div className={styles.aboutContent}>
            <div className={styles.aboutImageWrapper}>
              <img
                src="/waste-sorting.jpg" // Ensure this image exists in your public folder
                alt="Waste Sorting"
                className={styles.aboutImage}
              />
            </div>
            <div className={styles.aboutText}>
              <p className={styles.aboutParagraph}>
                Smart Waste Swaraj is an innovative platform designed to bridge
                the gap between households/businesses generating waste and
                dedicated waste collectors. We empower users to easily list
                their recyclable and non-recyclable waste, making it visible to
                local collectors who can efficiently pick it up.
              </p>
              <p className={styles.aboutParagraph}>
                Our mission is to foster a cleaner environment, reduce landfill
                burden, and support a circular economy by streamlining the waste
                collection process and promoting responsible disposal practices
                across India.
              </p>
              <Link href="/map" className={styles.exploreMapButton}>
                <FaMapMarkedAlt className={styles.buttonIcon} /> Explore Waste
                Map
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features/Benefits Section */}
      <section className={styles.benefitsSection}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>Key Benefits</h2>
          <div className={styles.benefitsGrid}>
            <div className={styles.benefitCard}>
              <FaLeaf
                className={styles.benefitIcon}
                style={{ color: "var(--status-completed)" }}
              />
              <h3 className={styles.benefitTitle}>Eco-Friendly</h3>
              <p className={styles.benefitDescription}>
                Reduce your carbon footprint and contribute to a healthier
                planet by recycling efficiently.
              </p>
            </div>
            <div className={styles.benefitCard}>
              <FaMapMarkedAlt
                className={styles.benefitIcon}
                style={{ color: "var(--color-primary)" }}
              />
              <h3 className={styles.benefitTitle}>Efficient Collection</h3>
              <p className={styles.benefitDescription}>
                Connect directly with collectors, ensuring timely and convenient
                waste pickup.
              </p>
            </div>
            <div className={styles.benefitCard}>
              <FaRecycle
                className={styles.benefitIcon}
                style={{ color: "#8a2be2" /* Custom purple */ }}
              />
              <h3 className={styles.benefitTitle}>Sustainable Future</h3>
              <p className={styles.benefitDescription}>
                Support a circular economy and promote responsible waste
                management practices.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className={styles.faqSection}>
        <div className={styles.container}>
          <h2 className={styles.faqSectionTitle}>Frequently Asked Questions</h2>
          <div className={styles.faqContainer}>
            {faqData.map((item, index) => (
              <div
                key={index}
                className={`${styles.faqItem} ${
                  openFAQ === index ? styles.faqItemActive : ""
                }`}
              >
                <button
                  className={`${styles.faqQuestion} ${
                    openFAQ === index ? styles.faqQuestionActive : ""
                  }`}
                  onClick={() => toggleFAQ(index)}
                >
                  <span className={styles.faqQuestionText}>
                    {item.question}
                  </span>
                  <div className={styles.faqIcon}>
                    {openFAQ === index ? <FaMinus /> : <FaPlus />}
                  </div>
                </button>
                {/* THIS IS THE CRUCIAL WRAPPER FOR SMOOTH ANIMATION */}
                <div
                  className={`${styles.faqAnswerWrapper} ${
                    openFAQ === index ? styles.faqAnswerOpen : ""
                  }`}
                >
                  <div className={styles.faqAnswer}>
                    <p>{item.answer}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

const faqData = [
  {
    question: "What is Smart Waste Swaraj?",
    answer:
      "Smart Waste Swaraj is a nationwide digital platform that connects households and small businesses to local informal waste collectors (kabadiwalas/rag pickers) and upcycling/recycling businesses. We facilitate efficient segregation, pickup, and valorization of dry waste to create a circular economy network.",
  },
  {
    question: "How do I list my waste for collection?",
    answer:
      "Simply create an account, take photos of your segregated dry waste (paper, plastic, metal, glass, e-waste, textiles), add details about quantity and type, select your preferred pickup time, and post the listing. Local collectors will be notified and can accept your pickup request.",
  },
  {
    question: "How do I work as a waste collector on the platform?",
    answer:
      "Register as a collector (kabadiwala/recycler), browse nearby waste listings in your area, accept pickup requests that match your preferences, manage your collection routes efficiently, and rate transactions. The platform helps you discover new customers and optimize your collection routes.",
  },
  {
    question: "What types of waste are accepted on the platform?",
    answer:
      "We focus on dry waste including paper and cardboard, various types of plastics, metal items, glass, electronic waste (e-waste), and textiles. All waste must be properly segregated at source before listing. We currently don't handle wet/organic waste.",
  },
  {
    question: "Is there a charge for using Smart Waste Swaraj?",
    answer:
      "The platform is free to use for both waste generators and collectors. Our goal is to facilitate connections and formalize the existing informal waste collection network. Any payment arrangements for waste collection are made directly between generators and collectors.",
  },
  {
    question: "How does the platform help the environment?",
    answer:
      "By connecting waste generators with collectors, we divert dry waste from landfills, support the circular economy, empower informal sector workers, and promote proper waste segregation at source. This creates a visible loop where waste becomes a resource for recycling and upcycling businesses.",
  },
  {
    question: "Can I track my waste collection impact?",
    answer:
      "Yes! Our public dashboard shows anonymized data on total waste diverted from landfills, popular material types, and active 'Green Zones' (neighborhoods with high engagement). You can see the collective impact of your community's waste segregation efforts.",
  },
  {
    question: "How do you ensure quality and reliability?",
    answer:
      "We use a rating system for both generators and collectors, encourage proper waste segregation through quality scoring, and provide geolocation-based matching to connect nearby users. The platform also includes pickup confirmations and transaction history tracking.",
  },
];
