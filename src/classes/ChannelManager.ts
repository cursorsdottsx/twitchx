import fetch from "node-fetch";
import { Client } from "../base";
import Manager from "../base/Manager";
import { BASE_URL } from "../shared/constants";
import Channel from "./Channel";

export const CHANNEL_MANAGER_CACHE_ACCESS = new WeakMap<ChannelManager, (channel: Channel) => void>();

export default class ChannelManager extends Manager<Channel> {
    constructor(protected client: Client) {
        super(client);

        CHANNEL_MANAGER_CACHE_ACCESS.set(this, (channel) => {
            this.cache.set(channel.id, channel);
        });
    }

    public get(id: string) {
        return this.cache.get(id);
    }

    public clear() {
        return this.cache.clear();
    }

    public has(id: string) {
        return this.cache.has(id);
    }

    public keys() {
        return this.cache.keys();
    }

    public values() {
        return this.cache.values();
    }

    public entries() {
        return this.cache.entries();
    }

    public get size() {
        return this.cache.size;
    }

    public async fetch(id: string, force?: boolean) {
        if (this.has(id) && !force) return this.get(id);

        const response = await fetch(`${BASE_URL}/channels`, {
            headers: {
                authorization: `OAuth ${this.client.token}`,
            },
        });

        if (response.ok) return new Channel(this.client, await response.json());

        if (!this.client.options.handleRejections) throw new Error(`unable to fetch channel`);

        return;
    }
}
