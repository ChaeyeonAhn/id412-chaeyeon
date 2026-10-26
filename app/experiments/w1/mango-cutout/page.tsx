import styles from "./page.module.css";

export default function MangoCutout() {
  return (
    <main className={styles.root}>
      <img className={styles.image} src="/experiments/w1/mango-cutout/mango.png" alt="A ripe mango with no background" />
    </main>
  );
}
