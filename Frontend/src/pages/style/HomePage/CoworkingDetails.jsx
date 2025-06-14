import styles from './CoworkingDetails.module.css';
import DetailCard from './DetailCard';

const detailsData = [
    {
        title: 'What is Coworking?',
        content: 'Coworking is short for collaborative working. It is an emerging style of working in an innovative environment; essentially a shared work space. But it is more flexible in its approach than traditional office environments. Coworking offers sharing of equipment, resources, ideas, and/or experience among remote professionals. There are thousands of these shared office spaces. And as coworking spaces are in almost every country on Earth. The coworking model is unique in that workers can choose to remain independent and self-directed; but can often find more opportunities for collaboration and networking among like-minded individuals.',
        linkText: 'READ MORE ABOUT COWORKING',
        linkHref: '#',
    },
    {
        title: 'Benefits of Coworking',
        content: 'Recent surveys and research suggests people are more productive and creative when working from a coworking space. With reduced distractions, a collective mindset, and potential cross-cross-pollination of contributing to a collaborative work space, workers can typically work faster and not only finish more work in a coworking environment than other working arrangements.\n\nSmaller businesses and independent professionals find coworking provides affordable office space with important work necessities like high-speed internet, printers, and meeting rooms, resulting in lower startup costs.',
        linkText: 'MORE COWORKING ADVANTAGES',
        linkHref: '#',
    },
    {
        title: 'Why WorkZen?',
        content: 'WorkZen is a website where you can search, find, and reserve shared workspace, including coworking desks, private offices, meeting rooms,and virtual offices near you. Coworking spaces list their workspace on WorkZen and outline what features and amenities their space can offer. Professionals and companies can then compare all the available coworking spaces to find one that has the services and amenities that fit their requirements.\n\nOnce you\'ve found the coworking space that is best for you, you can inquire about booking a schedule a tour, and reserve your space.',
        linkText: '',
        linkHref: '',
    },
];

function CoworkingDetails() {
    return (
        <section className={styles.coworkingDetails}>
            {detailsData.map((detail, index) => (
                <DetailCard key={index} detail={detail} />
            ))}
        </section>
    );
}

export default CoworkingDetails;