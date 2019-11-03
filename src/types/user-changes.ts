import IHullAttributeChanges from "./attribute-changes";
import { IHullSegmentChanges } from "./hull-segment-changes";

export default interface IHullUserChanges {
    user: IHullAttributeChanges;
    account: IHullAttributeChanges;
    segments: IHullSegmentChanges;
}