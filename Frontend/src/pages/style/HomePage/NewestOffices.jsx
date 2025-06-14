import styles from './NewestOffices.module.css';
import OfficeCard from './OfficeCard.jsx';

const officesData = [
    { name: 'MyWork', location: 'Coimbatore, India', image: '/path/to/mywork.jpg', link: 'https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse2.mm.bing.net%2Fth%3Fid%3DOIP.h2nUKqUQkDBN0g4OkTnuHwHaE8%26pid%3DApi&f=1&ipt=0943ab856be9921fa1511335ec1dff99ccdd540af7c904ad05207a55e9ffd47a&ipo=images' },
    { name: 'White Collar', location: 'Jaipur, India', image: '/path/to/whitecollar.jpg', link: 'https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Flive.staticflickr.com%2F8221%2F8269964920_b5d1b4f94c_b.jpg&f=1&nofb=1&ipt=0db85493cc50078af9bc7d30fbf28348fc4f6c80cf9d125ed4ba7fa13216980e' },
    { name: 'GoNWork', location: 'Chennai, India', image: '/path/to/gonwork.jpg', link: 'https://external-content.duckduckgo.com/iu/?u=http%3A%2F%2Ffarm5.staticflickr.com%2F4049%2F4448498633_beb22a1f65_o.jpg&f=1&nofb=1&ipt=ec1a06aa55cb17eff090a22e08661067cb400c8eb0f0967957d4fb1fa0cd72a9' },
];

function NewestOffices() {
    return (
        <section className={styles.newestOffices}>
            <h2>Newest Flexible Office Spaces</h2>
            <div className={styles.officesList}>
                {officesData.map((office, index) => (
                    <OfficeCard key={index} office={office} />
                ))}
            </div>
        </section>
    );
}

export default NewestOffices;