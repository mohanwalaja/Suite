// Public model API. The base-models module keeps the original fifty hand-authored studies;
// the Creative Registry expands them into 100 independently defined compositions per subject.
import { registry } from '../creative/registry.js';
import {
  picturesFor as basePicturesFor,
  collectionInfo as baseCollectionInfo,
} from './base-models.js';

export const modelsFor = (topic) => registry.definitionsFor(topic);
export const modelFor = (topic, id = 0) => registry.modelFor(topic, id);
export const picturesFor = (topic) => basePicturesFor(topic);
export const collectionInfo = (topic) => {
  const info = baseCollectionInfo(topic);
  return info.description.includes('50 poster designs')
    ? { ...info, description: info.description.replace('50 poster designs', '100 poster designs') }
    : info;
};
export { signs, planets, checks, mansionNames } from './base-models.js';
export { registry as creativeRegistry } from '../creative/registry.js';
