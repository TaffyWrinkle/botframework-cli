/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import * as path from 'path';
import {Utility} from './utility';
import {OrchestratorHelper} from './orchestratorhelper';

const oc: any = require('orchestrator-core/build/Release/orchestrator-core.node');

export class LabelResolver {
  public static Orchestrator: any;

  public static LabelResolver: any;

  public static async loadNlrAsync(nlrPath: string) {
    if (nlrPath) {
      nlrPath = path.resolve(nlrPath);
    }
    // if (nlrPath.length === 0) {
    //   throw new Error('Please provide path to Orchestrator model');
    // }
    Utility.debuggingLog('LabelResolver.loadNlrAsync(): Creating Orchestrator..');
    LabelResolver.Orchestrator = new oc.Orchestrator();

    if (nlrPath) {
      Utility.debuggingLog('LabelResolver.loadNlrAsync(): Loading NLR..');
      if (await LabelResolver.Orchestrator.load(nlrPath) === false) {
        throw new Error('Loading NLR failed!');
      }
    }
  }

  public static async createAsync(nlrPath: string, useCompactEmbeddings: boolean = true) {
    await LabelResolver.loadNlrAsync(nlrPath);
    Utility.debuggingLog('LabelResolver.createAsync(): Creating labeler..');
    LabelResolver.LabelResolver = LabelResolver.Orchestrator.createLabelResolver(useCompactEmbeddings);
    return LabelResolver.LabelResolver;
  }

  public static async createWithSnapshotAsync(nlrPath: string, snapshotPath: string) {
    const encoder: TextEncoder = new TextEncoder();
    const snapshot: Uint8Array = encoder.encode(OrchestratorHelper.readFile(snapshotPath));
    await LabelResolver.loadNlrAsync(nlrPath);
    Utility.debuggingLog(`LabelResolver.createWithSnapshotAsync(): nlrPath=${nlrPath}`);
    Utility.debuggingLog(`LabelResolver.createWithSnapshotAsync(): typeof(snapshot)=${typeof snapshot}`);
    Utility.debuggingLog(`LabelResolver.createWithSnapshotAsync(): snapshot.byteLength=${snapshot.byteLength}`);
    Utility.debuggingLog('LabelResolver.createWithSnapshotAsync(): Creating labeler..');
    LabelResolver.LabelResolver = await LabelResolver.Orchestrator.createLabelResolver(snapshot);
    Utility.debuggingLog('LabelResolver.createWithSnapshotAsync(): Done creating labeler..');
    return LabelResolver.LabelResolver;
  }

  public static addExamples(utterancesLabelsMap: { [id: string]: string[]; }) {
    // eslint-disable-next-line guard-for-in
    for (const utterance in utterancesLabelsMap) {
      const labels: string[] = utterancesLabelsMap[utterance];
      for (const label of labels) {
        const success: any = LabelResolver.LabelResolver.addExample({label: label, text: utterance});
        if (success) {
          Utility.debuggingLog(`LabelResolver.addExamples(): Added { label: ${label}, text: ${utterance}}`);
        }
      }
    }
  }
}
