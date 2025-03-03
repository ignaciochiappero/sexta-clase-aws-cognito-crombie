# Use the official MySQL image as a base
FROM mysql:8.0

# Set environment variables for MySQL configuration
ENV MYSQL_ROOT_PASSWORD=root 
ENV MYSQL_USER=hydorn        
ENV MYSQL_PASSWORD=root

# Expose the MySQL port (3306)
EXPOSE 3306