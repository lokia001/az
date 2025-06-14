import styles from './WhatIsCoworker.module.css';

function WhatIsCoworker() {
    return (
        <section className={styles.whatIsCoworker}>
            <div className={styles.coworkerInfo}>
                <h2>What is WorkZen?</h2>
                <p>WorkZen is an online platform for discovering, booking, and accessing coworking spaces around in Vietnam.</p>
                <a href="#">LEARN MORE ABOUT WorkZen</a>
            </div>

        </section>
    );
}

export default WhatIsCoworker;