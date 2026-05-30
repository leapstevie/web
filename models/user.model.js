class User {
    constructor(id, name, email, age, salary) {
        this.id     = id;
        this.name   = name;
        this.email  = email;
        this.age    = age;
        this.salary = salary;
    }

    getFullInfo() {
        return `${this.name} | ${this.email} | Age: ${this.age} | Salary: $${this.salary}`;
    }
}

export default User;