import styles from "./page.module.css";

export default function Mango() {
  return (
    <main className={styles.root}>
      <img className={styles.image} src="/experiments/w1/mango/mango.jpg" alt="A ripe mango hanging from a branch" />
    </main>
  );
}
