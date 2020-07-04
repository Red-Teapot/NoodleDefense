import { Random } from "excalibur";

export default class WeighedRandom<T> {
    private readonly table = new Map<T, number>();
    private weightSum = 0;

    add(key: T, weight: number) {
        if(weight <= 0) {
            throw 'Weight must be greater than zero';
        }

        this.table.set(key, weight);
        this.weightSum += weight;
    }

    randomize(random: Random): T {
        var rnd = random.floating(0, this.weightSum);
        var result: T | null = null;

        this.table.forEach((weight, entry) => {
            if(result != null) {
                return;
            }

            if(rnd <= weight) {
                result = entry;
            } else {
                rnd -= weight;
            }
        });

        return result!;
    }
}