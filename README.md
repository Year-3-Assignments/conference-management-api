## Conference Management System - API
### This management system project is for Application Framework(AF) module.

This is backend API for conference management system. Technology that we are using to implement this application is **Node JS**, **Express**, **MongoDB** and **Firebase**.

### How to contribute
1. Fork the project into your local GitHub profile.:fork_and_knife:
2. Clone that project into your computer.:rocket:
3. Assign a issue from the **issue** tab. - *All the issues are the **features** of the API.*
4. Create new brach and called it with the respected feature.:seedling:
> For example: Issue - Create customer account
> Then you should name your brach like this.
> `feature/customer-account`
> Brach name always should be simple letters.
5. Do your modifications to the code.👨‍💻
6. Commit changes to your local repository.💬
7. Create a pull request to upstream repository.:hand:
> Before create the pull request, please chack if there are merge conflicts in your code. If there are not conflicts, then create the **Pull Request(PR)**
8. Then you have to assign one or more team members to review your code.:eyes:
> After reviewing process are done and your code is ready to merge, one of our organization member will merge your changes to the **master** branch.
## Run the API using Docker image
This docker container holds the backend API application for the REACH conference system.

#### How to set up and run the application
1. Install **Docker** into your local computer.
2. Pull the docker image using **docker pull rusiruavb/conference-api-docker:latest**
3. Run **docker run -p 9002:9090 rusiruavb/conference-api-docker:latest** command to create the docker container and run.
4. Then the application will be exposed on port 9002.
5. Navigate to your browser and copy/paste this link **http://localhost:9002/**
