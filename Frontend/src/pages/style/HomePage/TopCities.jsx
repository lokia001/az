import styles from './TopCities.module.css';
import CityCard from './CityCard';

const citiesData = [
    { name: 'London', image: '/path/to/london.jpg' },
    { name: 'New York City', image: '/path/to/newyork.jpg' },
    { name: 'Bengaluru', image: '/path/to/bengaluru.jpg' },
    { name: 'Mexico City', image: '/path/to/mexicocity.jpg' },
    { name: 'Jakarta', image: '/path/to/jakarta.jpg' },
    { name: 'Tokyo', image: '/path/to/tokyo.jpg' },
    { name: 'Barcelona', image: '/path/to/barcelona.jpg' },
    { name: 'Sao Paulo', image: '/path/to/saopaulo.jpg' },
    { name: 'Bangkok', image: '/path/to/bangkok.jpg' },
    { name: 'Lagos', image: '/path/to/lagos.jpg' },
    { name: 'Munich', image: '/path/to/munich.jpg' },
    { name: 'Bristol', image: '/path/to/bristol.jpg' },
    { name: 'Sydney', image: '/path/to/sydney.jpg' },
    { name: 'Melbourne', image: '/path/to/melbourne.jpg' },
    { name: 'Ottawa', image: '/path/to/ottawa.jpg' },
];

function TopCities() {
    return (
        <section className={styles.topCities}>
            <h2>Top Coworking Cities</h2>
            <div className={styles.citiesGrid}>
                {citiesData.map((city, index) => (
                    <CityCard key={index} name={city.name} image={city.image} />
                ))}
            </div>
        </section>
    );
}

export default TopCities;