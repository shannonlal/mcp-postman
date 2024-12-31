import { CollectionRunOptions, TestResult } from '../server/types.js';
export declare class NewmanRunner {
    /**
     * Runs a Postman collection using Newman
     * @param options Collection run options
     * @returns Test results
     */
    runCollection(options: CollectionRunOptions): Promise<TestResult>;
}
