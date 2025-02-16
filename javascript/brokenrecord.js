function checkrecord(goals){
    console.log(goals)
    if (goals > 894) {
        let row2 = document.getElementById("row2");
        let row3 = document.getElementById("row3");
        let parent = row2.parentNode;

        // Swap rows
        parent.insertBefore(row3, row2);

        // Swap class names
        let tempClass = row2.className;
        row2.className = row3.className;
        row3.className = tempClass;
    }
}