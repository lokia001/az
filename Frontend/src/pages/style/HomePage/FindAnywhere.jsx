import styles from './FindAnywhere.module.css';
import map from "../../../assets/ban-do-so.jpg";

function FindAnywhere() {
    return (
        <section className={styles.findAnywhere}>
            <h2>Find Flexible Office Space Anywhere</h2>
            <p>The world's largest network of coworking spaces</p>
            <div className={styles.worldMap}>
                <img src={map} alt="World Map" />
            </div>
        </section>
    );
}

export default FindAnywhere;