import * as core from '@actions/core';

import main from '../main';
import { TestInputs, clearInputs, getBaseInput, setInputs } from './utils/utils';

describe('Get Integration Tests', () => {
	let outputMock: jest.SpyInstance;
	let failedMock: jest.SpyInstance;
	let input: TestInputs = {};

	beforeAll(() => {
		outputMock = jest.spyOn(core, 'setOutput');
		failedMock = jest.spyOn(core, 'setFailed');
	});

	beforeEach(() => {
		jest.clearAllMocks();
		clearInputs(input);
		input = {};
	});

	test('Should get entity successfully', async () => {
		input = {
			...getBaseInput(),
			...{
				operation: 'GET',
				identifier: 'e_nrw9dSY4yAYl9A8U',
				blueprint: 'gh-action-test-bp2',
			},
		};

		setInputs(input);

		await main();

		expect(outputMock).toHaveBeenCalledWith('entity', {
			blueprint: 'gh-action-test-bp2',
			identifier: 'e_nrw9dSY4yAYl9A8U',
			properties: { str: 'foo' },
			relations: {},
			title: 'GH Action 2 Test Identity',
		});
		expect(failedMock).toHaveBeenCalledTimes(0);
	});

	test('Should fail get input - missing required param identifier', async () => {
		input = {
			...getBaseInput(),
			...{
				operation: 'GET',
				blueprint: 'gh-action-test-bp2',
			},
		};

		setInputs(input);

		await main();

		expect(outputMock).toHaveBeenCalledTimes(0);
		expect(failedMock).toHaveBeenCalledWith('GET Operation - identifier is missing from input');
	});

	test('Should fail get input - entity not exists', async () => {
		input = {
			...getBaseInput(),
			...{
				operation: 'GET',
				identifier: 'invalidIdentifier',
				blueprint: 'invalidBlueprint',
			},
		};

		setInputs(input);

		await main();

		expect(outputMock).toHaveBeenCalledTimes(0);
		expect(failedMock).toHaveBeenCalledWith('Request failed with status code 404');
	});
});
