import styles from './HeroSection.module.css';

function HeroSection() {
    return (
        <section className={styles.heroSection}>
            <div className={styles.heroContent}>
                <h2 className={styles.heroTitle}>Where would you like to <span className={styles.heroWork}>work?</span></h2>
                <div className={styles.heroOptions}>
                    <label className={styles.optionLabel}>
                        <input type="checkbox" checked disabled />
                        <span className={styles.optionText}>Coworking Spaces</span>
                    </label>
                    <label className={styles.optionLabel}>
                        <input type="checkbox" checked disabled />
                        <span className={styles.optionText}>Private Offices</span>
                    </label>
                    <label className={styles.optionLabel}>
                        <input type="checkbox" checked disabled />
                        <span className={styles.optionText}>Virtual Offices</span>
                    </label>
                    <label className={styles.optionLabel}>
                        <input type="checkbox" checked disabled />
                        <span className={styles.optionText}>Airport Lounges</span>
                    </label>
                </div>
                <div className={styles.searchContainer}>
                    <input
                        type="text"
                        className={styles.searchInput}
                        placeholder="Search by City or Space..."
                    />
                    {/* Có thể thêm icon tìm kiếm ở đây */}
                </div>
                <div className={styles.heroStats}>
                    <div className={styles.statItem}>
                        <span className={styles.statNumber}>172</span>
                        <span className={styles.statLabel}> Companies</span>
                    </div>
                    <div className={styles.statItem}>
                        <span className={styles.statNumber}>1000+</span>
                        <span className={styles.statLabel}> Coworking Spaces</span>
                    </div>
                    <div className={styles.statItem}>
                        <span className={styles.statNumber}>1 Million</span>
                        <span className={styles.statLabel}> Users</span>
                    </div>
                </div>
                <p className={styles.heroSubtitle}> Top rated space exploration</p>
            </div>
        </section>
    );
}

export default HeroSection;