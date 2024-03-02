// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import type {
	TransactionArgument,
	TransactionBlock,
	TransactionObjectArgument,
} from '@mysten/sui.js/transactions';

export interface ZkBagContractOptions {
	packageId: string;
	bagStoreId: string;
	bagStoreTableId: string;
}

export class ZkBag<IDs> {
	#package: string;
	#module = 'zk_bag' as const;
	ids: IDs;

	constructor(packageAddress: string, ids: IDs) {
		this.#package = packageAddress;
		this.ids = ids;
	}

	new(
		txb: TransactionBlock,
		{
			arguments: [store, receiver],
		}: {
			arguments: [
				store: TransactionObjectArgument | string,
				receiver: TransactionArgument | string,
			];
		},
	) {
		txb.moveCall({
			target: `${this.#package}::${this.#module}::new`,
			arguments: [
				txb.object(store),
				typeof receiver === 'string' ? txb.pure.address(receiver) : receiver,
			],
		});
	}

	add(
		txb: TransactionBlock,
		{
			arguments: [store, receiver, item],
			typeArguments,
		}: {
			arguments: [
				store: TransactionObjectArgument | string,
				receiver: TransactionArgument | string,
				item: TransactionObjectArgument | string,
			];
			typeArguments: [string];
		},
	): Extract<TransactionArgument, { kind: 'Result' }> {
		return txb.moveCall({
			target: `${this.#package}::${this.#module}::add`,
			arguments: [
				txb.object(store),
				typeof receiver === 'string' ? txb.pure.address(receiver) : receiver,
				txb.object(item),
			],
			typeArguments: typeArguments,
		});
	}

	init_claim(
		txb: TransactionBlock,
		{
			arguments: [store, receiver],
		}: {
			arguments: [
				store: TransactionObjectArgument | string,
				receiver: TransactionArgument | string,
			];
		},
	) {
		const [bag, claimProof] = txb.moveCall({
			target: `${this.#package}::${this.#module}::init_claim`,
			arguments: [
				txb.object(store),
				typeof receiver === 'string' ? txb.pure.address(receiver) : receiver,
			],
		});

		return [bag, claimProof] as const;
	}

	claim(
		txb: TransactionBlock,
		{
			arguments: [bag, claim, id],
			typeArguments,
		}: {
			arguments: [
				bag: TransactionObjectArgument | string,
				claim: TransactionObjectArgument | string,
				id: TransactionArgument | number,
			];
			typeArguments: [string];
		},
	): Extract<TransactionArgument, { kind: 'Result' }> {
		return txb.moveCall({
			target: `${this.#package}::${this.#module}::claim`,
			arguments: [
				txb.object(bag),
				txb.object(claim),
				typeof id === 'number' ? txb.pure.u16(id) : id,
			],
			typeArguments,
		});
	}

	finalize(
		txb: TransactionBlock,
		{
			arguments: [bag, claim],
		}: {
			arguments: [
				bag: TransactionObjectArgument | string,
				claim: TransactionObjectArgument | string,
			];
		},
	) {
		txb.moveCall({
			target: `${this.#package}::${this.#module}::finalize`,
			arguments: [txb.object(bag), txb.object(claim)],
		});
	}
}
