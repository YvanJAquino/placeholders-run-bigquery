import { Accessor, Component, For, createEffect, createSignal } from 'solid-js';
import { preview } from 'vite';
import { DadJokeGenerator } from './tools/Jokes';

type SolidInputEvent = InputEvent & {
    currentTarget: HTMLInputElement;
    target: HTMLInputElement;
}

type GenericObject<T> = {
	[key: string]: T
}

type Data = {
	message: string;
	number: string;
}

interface ISolidInput {
	key: string;
	value: Accessor<GenericObject<string>>;
	onInput: (e: SolidInputEvent) => void
}

const SolidInput = (props: ISolidInput) => {
	return <input
		name={props.key}
		type='text'
		placeholder={props.key}
		value={props.value()[props.key]}
		onInput={props.onInput}
	/>
}

export default function App() {
	const _query =`
SELECT	message, 
		number
FROM 	\`${import.meta.env.VITE_PROJECT_ID}.${import.meta.env.VITE_DATASET_ID}.${import.meta.env.VITE_TABLE_ID}\`
`

	const [query, setQuery] = createSignal(<></>)
	const [input, setInput] = createSignal({ message: '', number: '' });
	DadJokeGenerator.getJoke()
		.then(jokeResponse => setInput(_ => {
			return {
				message: jokeResponse.joke,
				number: String(Math.floor(Math.random() * 1_000_000_000))
			}
		}))
	const onInput = (e: SolidInputEvent ) => {
		setInput(prev => {
			return {
				...prev,
				[e.target.name]: e.target.value
			}
		});
	}

	return (<>
		<div >
			<h1>Google Cloud Platform Frontend Placeholder</h1>
		</div>
		<div>
			<h2>Input area</h2>
			<SolidInput key='message' value={input} onInput={onInput}/>
			<p/>
			<SolidInput key='number' value={input} onInput={onInput} />
			<p/>
			<button
				onClick={() => {
					insertRow(input())
						.then(response => {
							console.log(response.status)
							DadJokeGenerator.setJokeState(setInput)
						})
						.catch(e => console.log(e))
				}}
			>SUBMIT</button>
		</div>
		<div>
			<h2>Reactive Preview Area</h2>
			<pre>
				{JSON.stringify(input(), null, 2)}
			</pre>
		</div>
		<div>
			<h1>Query area</h1>
			<button
				title={_query}
				onClick={() => {
					fetchQuery(_query)
						.then(data => {
							const dataTable = <table>
								<tbody>
								<tr>
									<th>message</th>
									<th>number</th>
								</tr>
								<For each={data}>
									{(datum) => {
										return <tr>
											<td>{datum.message}</td>
											<td>{datum.number}</td>
										</tr>
									}}
								</For>
								</tbody>
								{/*@once*/}
							</table>
							console.log(dataTable);
							setQuery(dataTable);
						})
				}}
			>
				Fetch Data!
			</button>
			<h1>Query Result</h1>
			{query()}
		</div>
	</>)
}

const insertRow = async (data: Data) => {
	const insertRowURL = '/insert'
	return fetch(insertRowURL, {
		method: 'POST',
		body: JSON.stringify(data),
	})
}

const fetchQuery = async (query: string, size?: number) => {
	const queryURL = "/query"

	const response = await fetch(queryURL, {
		method: 'POST',
		body: JSON.stringify({
			query,
			size: 10,
		})
	})

	return await response.json() as Data[]
}