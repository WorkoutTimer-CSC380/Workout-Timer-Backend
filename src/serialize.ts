import fs from "fs";

import { RecentsQueue } from "./queue";
import { Exercise, Workout } from "./workout";

export class Serializer {
    constructor(private readonly workoutPath: string = "./workouts", private readonly exercisePath: string = "./exercises") {
        // Create folders
        if (!fs.existsSync(workoutPath)) {
            fs.mkdirSync(workoutPath);
        }

        if (!fs.existsSync(exercisePath)) {
            fs.mkdirSync(exercisePath);
        }
    }

    /**
     * Serialize a Workout into a JSON file
     * 
     * NOTE: This will overwrite the file if it exists!
     * 
     * @param workout Workout to serialize
     */
    writeWorkout(workout: Workout): void {
        const wantedPath = `${this.workoutPath}/${workout.name}.json`;

        fs.writeFile(wantedPath, JSON.stringify(workout), (err) => {
            if (err) {
                console.error(`Failed to write workout to ${wantedPath}`);
            }
        });
    }

    /**
     * Grab a workout object from storage
     * 
     * @param name Name of the workout
     * @returns The workout object if it exists otherwise undefined
     */
    readWorkout(name: string): Workout | undefined {
        const wantedPath = `${this.workoutPath}/${name}.json`;

        if (!fs.existsSync(wantedPath)) {
            console.warn(`Could not find workout at ${wantedPath}!`);
            return undefined;
        }

        const workoutStr = fs.readFileSync(wantedPath, { encoding: "utf-8", flag: "r" });

        return JSON.parse(workoutStr) as Workout;
    }

    /**
     * Delete's a workout record from storage
     * 
     * WARNING: This function is rather unsafe! People could redirect via path manipulation and
     * potentially delete something else. Sanitize that input!
     * 
     * @param name Name of the workout
     */
    deleteWorkout(name: string): void {
        if (this.hasWorkout(name)) {
            fs.rmSync(`${this.workoutPath}/${name}.json`);
        }
    }

    hasWorkout(name: string): boolean {
        return fs.existsSync(`${this.workoutPath}/${name}.json`);
    }

    loadRecentWorkouts(max = 10): RecentsQueue {
        // Create recent-workouts.json if it doesn't exist and give it an empty array
        if (!fs.existsSync("./recent-workouts.json")) {
            fs.writeFileSync("./recent-workouts.json", "[]");
        }

        const recentsStr = fs.readFileSync("./recent-workouts.json", { encoding: "utf-8", flag: "r" });
        const recentsArray = JSON.parse(recentsStr) as Workout[];

        return new RecentsQueue(max, recentsArray);
    }

    writeRecentWorkouts(recents: RecentsQueue): void {
        const recentsArrayStr = recents.toString();

        fs.writeFileSync("./recent-workouts.json", recentsArrayStr);
    }

    writeExercise(exercise: Exercise): void {
        const wantedPath = `${this.exercisePath}/${exercise.name}.json`;

        fs.writeFile(wantedPath, JSON.stringify(exercise), (err) => {
            if (err) {
                console.error(`Failed to write exercise to ${wantedPath}`);
            }
        });
    }

    readExercise(name: string): Workout | undefined {
        const wantedPath = `${this.exercisePath}/${name}.json`;

        if (!fs.existsSync(wantedPath)) {
            console.warn(`Could not find exercise at ${wantedPath}!`);
            return undefined;
        }

        const workoutStr = fs.readFileSync(wantedPath, { encoding: "utf-8", flag: "r" });

        return JSON.parse(workoutStr) as Workout;
    }

    deleteExercise(name: string): void {
        if (this.hasExercise(name)) {
            fs.rmSync(`${this.exercisePath}/${name}.json`);
        }
    }

    hasExercise(name: string): boolean {
        return fs.existsSync(`${this.exercisePath}/${name}.json`);
    }

    // NOTE: Could make this lazy but we need to also check if there are new exercises
    // So add some sort of "dirty" flag
    allExercises(): Exercise[] {
        const exercises: Exercise[] = [];

        fs.readdirSync(this.exercisePath).map(
            fileName => {
                const wantedPath = `${this.exercisePath}/${fileName}`;
                const exerciseStr = fs.readFileSync(wantedPath, { encoding: "utf-8", flag: "r" });
                exercises.push(JSON.parse(exerciseStr) as Exercise);
            }
        );

        return exercises;
    }

    listExerciseNames(): string[] {
        return fs.readdirSync(this.exercisePath).map(
            fileName => fileName.substring(0, fileName.length - ".json".length)
        );
    }

    listWorkoutNames(): string[] {
        return fs.readdirSync(this.workoutPath).map(
            fileName => fileName.substring(0, fileName.length - ".json".length) // NOTE: is this a good idea?
        );
    }
}