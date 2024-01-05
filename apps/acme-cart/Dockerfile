# Use an official Python runtime as a base image
FROM python:3.11

# Set the working directory in the container
WORKDIR /app

# Copy the entire local directory into the container at /app
COPY . /app

# Install dependencies
RUN pip install -r requirements.txt

# Specify the command to run your application
CMD ["python", "cart.py"]
