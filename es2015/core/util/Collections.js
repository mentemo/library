export default class Collections {
    /**
     * The singletonList(T) method is used to return an immutable list containing only the specified object.
     */
    static singletonList(item) {
        return [item];
    }
    /**
     * Sorts the specified list according to the order induced by the specified comparator.
     */
    static sort(list, comparator) {
        list.sort(comparator.compare);
    }
    /**
     * The min(Collection<? extends T>, Comparator<? super T>) method is used to return the minimum element of the given collection, according to the order induced by the specified comparator.
     */
    static min(collection, comparator) {
        return collection.sort(comparator)[0];
    }
}
//# sourceMappingURL=Collections.js.map