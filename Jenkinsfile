pipeline {
    agent any

    stages {

        stage('Checkout') {
            steps {
                echo 'Checking out source code from GitHub...'
            }
        }
        stage('Prepare Environment') {
            steps {
                bat 'copy /Y .env.example .env'
            }
        }

        stage('Docker Version') {
            steps {
                bat 'docker --version'
                bat 'docker-compose --version'
            }
        }

        stage('Validate Docker Compose') {
            steps {
                bat 'docker-compose config'
            }
        }

        stage('Build Docker Images') {
            steps {
                bat 'docker-compose build'
            }
        }
    }

    post {
        success {
            echo 'CI Pipeline completed successfully!'
        }

        failure {
            echo 'CI Pipeline failed. Check the console output.'
        }
    }
}