import React from 'react';
import './Footer.css'; // Import CSS cho Footer
import { useTranslation } from 'react-i18next';

function Footer() {
    const { t, i18n } = useTranslation();
    return (
        <footer className="footer">
            <div className="footer-container">
                <div className="footer-column">
                    <h3>WorkZen</h3>
                    <ul>

                        <li><a href="#">{t("about_us")}</a></li>
                        <li><a href="#">{t("products")}</a></li>
                    </ul>
                </div>
                <div className="footer-column">
                    <h3>{t("supports")}</h3>
                    <ul>
                        <li>{t("CSKH")}: 0941742***</li>
                        <li>Email: hahuu3675@email.com</li>
                        <li>{t("time")}: {t("from")} 7h00 - 22h00 {t("daily")}</li>
                    </ul>
                </div>
                <div className="footer-column">
                    <h3>{t("collaboration")}</h3>
                    <ul>
                        <li><a href="#">{t("contact")}</a></li>
                        <li><a href="#">{t("investment")}</a></li>
                    </ul>
                </div>
                <div className="footer-column">
                    <h3>{t("contact")}</h3>
                    <ul>
                        <li><a href="#">Facebook</a></li>
                        <li><a href="#">Email</a></li>
                        <li>WorkZen</li>
                    </ul>
                </div>
            </div>
            <div className="footer-copyright">
                COPYRIGHT © 2025 WorkZen | * Mọi nội dung của Website phục vụ mục đích học tập
            </div>
        </footer>
    );
}

export default Footer;