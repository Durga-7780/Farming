# Use OpenJDK base image
FROM openjdk:17-jdk-slim

# Set working directory
WORKDIR /app

# Copy your JAR file
COPY target/Farming-0.0.1-SNAPSHOT.jar app.jar

# Expose the port your Spring Boot app runs on
EXPOSE 2004

# Run the app
ENTRYPOINT ["java", "-jar", "app.jar"]