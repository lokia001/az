import styles from './WorkplaceAnywhere.module.css';

function WorkplaceAnywhere() {
    return (
        <div className={styles.workplaceAnywhere}>
            <h2 className={styles.workplaceTitle}>Workplace for Any Team, Anywhere</h2>
            <p className={styles.workplaceDescription}>
                Over 6 million professionals and businesses have used Coworker to find workspace solutions.
            </p>
            <button className={styles.workplaceButton}>See Our Solutions</button>
        </div>
    );
}

export default WorkplaceAnywhere;