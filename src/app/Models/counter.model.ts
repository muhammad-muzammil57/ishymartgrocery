import mongoose from "mongoose"

// Auto-increment counters (e.g. product numbers). Har counter ka apna
// document hota hai: _id = counter ka naam, seq = ab tak ki count.
interface ICounter {
    _id: string,
    seq: number
}

const counterSchema = new mongoose.Schema<ICounter>({
    _id: { type: String, required: true },
    seq: { type: Number, default: 0 },
})

const Counter = mongoose.models.Counter || mongoose.model<ICounter>("Counter", counterSchema)
export default Counter
