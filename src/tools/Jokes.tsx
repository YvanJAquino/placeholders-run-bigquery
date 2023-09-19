import { Setter } from "solid-js";

type Data = {
	message: string;
	number: string;
}

type JokeResponse = {
    id: string;
    joke: string;
    status: number;
}

class DadJokeGenerator {

    static async getJoke() {
        const jokeURL = 'https://icanhazdadjoke.com'
        const jokeHeaders = {
            Accept: 'application/json'
        }
        const response = await fetch(jokeURL, { headers: jokeHeaders })
        return await response.json() as JokeResponse
    }

    static async setJokeState(setter: Setter<Data>) {
        this.getJoke()
            .then(jokeResponse => {
                setter({
                    message: jokeResponse.joke,
                    number: String(Math.floor(Math.random() * 1_000_000_000)),
                })
            })
            .catch(e => console.log(e));
    }
}

export {
    DadJokeGenerator
}